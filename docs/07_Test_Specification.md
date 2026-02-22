# 07 - Test Specification

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Document ID    | TS-001                                                 |
| Project        | Secure Agent OS / OpenNeo                              |
| Version        | 1.0                                                    |
| Date           | 2026-02-22                                             |
| Author         | OpenNeo Engineering Team                               |
| Status         | Draft                                                  |
| Traces From    | 03_Requirements_Specification, 05_Detailed_Design, 06_Test_Plan |
| Traces To      | (Test Execution Reports)                               |

---

## 1. Test Case Index

| TC ID | Category | Requirement | Description |
| --- | --- | --- | --- |
| TC-001 | Unit | FR-003 | Phi-3 Mini on 36GB => ok |
| TC-002 | Unit | FR-003 | 405B on 36GB => ng |
| TC-003 | Unit | FR-003 | Parallel agents increase => headroom decrease |
| TC-004 | Unit | FR-003 | Context length increase => headroom decrease |
| TC-005 | Unit | FR-003 | 16GB RAM patterns |
| TC-006 | Unit | FR-003 | 64GB/128GB RAM patterns |
| TC-007 | Unit | - | Model catalog: all models have required fields |
| TC-008 | Unit | - | Model catalog: requiredRAMBytes > 0 |
| TC-009 | Unit | - | Model catalog: contextLengthOptions non-empty |
| TC-010 | Hook | FR-001 | useStaticSystemInfo mock data retrieval |
| TC-011 | Hook | FR-007 | useDynamicSystemInfo polling start/stop |
| TC-012 | Hook | NFR-004 | API absent fallback behavior |

---

## 2. Mock Strategy

### 2.1 Default Mock Environment

All tests use a default mock defined in `tests/setup.ts` that simulates a **36GB M3 Pro** Mac:

```typescript
// tests/setup.ts (excerpt)
const mockElectronAPI = {
  platform: 'darwin',
  getStaticInfo: async () => ({
    cpuModel: 'Apple M3 Pro',
    chipGeneration: 'M3 Pro',
    gpuCores: 18,
    totalRAMBytes: 38_654_705_664,       // 36 GB
    diskTotalBytes: 994_662_584_320,
    diskFreeBytes: 524_288_000_000,
    osVersion: '15.3',
    architecture: 'arm64',
  }),
  getDynamicInfo: async () => ({
    freeRAMBytes: 30_000_000_000,         // ~27.9 GB free
    memoryPressure: 'normal' as const,
    cpuLoadPercent: 15.5,
    diskFreeBytes: 524_288_000_000,
    timestamp: new Date().toISOString(),
  }),
  getProcesses: async () => [
    { pid: 1234, ppid: 1, cpuPercent: 12.3, ramBytes: 478_150_656, command: 'node' },
    { pid: 5678, ppid: 1234, cpuPercent: 3.1, ramBytes: 134_217_728, command: 'electron' },
    { pid: 9012, ppid: 1, cpuPercent: 0.5, ramBytes: 67_108_864, command: 'Finder' },
  ],
  getBattery: async () => ({
    percent: 67,
    charging: false,
    timeRemaining: 222,
  }),
  killProcess: async (pid: number) => ({ success: true }),
  startPolling: () => {},
  stopPolling: () => {},
  onMetricsUpdate: (callback: Function) => {},
  getLoginItemSettings: async () => ({ openAtLogin: false }),
  setLoginItemSettings: async (openAtLogin: boolean) => ({ openAtLogin }),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
});
```

### 2.2 Mock Override Pattern

Individual tests can override specific methods:

```typescript
// Example: Override for 16GB RAM test
beforeEach(() => {
  window.electronAPI = {
    ...window.electronAPI!,
    getStaticInfo: async () => ({
      ...await defaultMock.getStaticInfo(),
      totalRAMBytes: 17_179_869_184, // 16 GB
    }),
    getDynamicInfo: async () => ({
      ...await defaultMock.getDynamicInfo(),
      freeRAMBytes: 10_000_000_000, // ~9.3 GB free
    }),
  };
});
```

### 2.3 API Absent Mock

For NFR-004 fallback testing:

```typescript
beforeEach(() => {
  // Remove electronAPI entirely
  Object.defineProperty(window, 'electronAPI', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});
```

---

## 3. Detailed Test Cases

### TC-001: Phi-3 Mini on 36GB => ok

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-001 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Must |
| **Description** | Verify that a small model (Phi-3 Mini 3.8B Q4) on a 36GB Mac is classified as "ok" |

**Preconditions:**
- `assessCompatibility` function is available
- Model: Phi-3 Mini (requiredRAMBytes = 2,684,354,560 / ~2.5GB)

**Input:**

| Parameter | Value |
| --- | --- |
| model.requiredRAMBytes | 2,684,354,560 |
| staticInfo.totalRAMBytes | 38,654,705,664 (36GB) |
| dynamicInfo.freeRAMBytes | 30,000,000,000 (~27.9GB) |
| parallelAgents | 1 |
| contextLength | 4096 |

**Expected Output:**

| Field | Expected Value |
| --- | --- |
| status | `"ok"` |
| headroomBytes | >= 2,147,483,648 (>= 2GB) |

**Pass Criteria:** `result.status === 'ok'` AND `result.headroomBytes >= 2_147_483_648`

**Test Code:**

```typescript
describe('assessCompatibility', () => {
  it('TC-001: Phi-3 Mini on 36GB => ok', () => {
    const model = {
      id: 'phi-3-mini',
      name: 'Phi-3 Mini',
      provider: 'Microsoft',
      parameterCount: 3_800_000_000,
      quantization: 'Q4_K_M',
      requiredRAMBytes: 2_684_354_560,
      contextLengthOptions: [
        { tokens: 4096, requiredRAMBytes: 2_684_354_560 },
      ],
    };

    const result = assessCompatibility(
      model,
      { totalRAMBytes: 38_654_705_664 },
      { freeRAMBytes: 30_000_000_000 },
      1,
      4096
    );

    expect(result.status).toBe('ok');
    expect(result.headroomBytes).toBeGreaterThanOrEqual(2_147_483_648);
  });
});
```

---

### TC-002: 405B on 36GB => ng

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-002 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Must |
| **Description** | Verify that a very large model (Llama 405B Q4) on a 36GB Mac is classified as "ng" |

**Input:**

| Parameter | Value |
| --- | --- |
| model.requiredRAMBytes | 236,223,201,280 (~220GB) |
| staticInfo.totalRAMBytes | 38,654,705,664 (36GB) |
| dynamicInfo.freeRAMBytes | 30,000,000,000 (~27.9GB) |
| parallelAgents | 1 |
| contextLength | 4096 |

**Expected Output:**

| Field | Expected Value |
| --- | --- |
| status | `"ng"` |
| headroomBytes | < 0 (large negative number) |

**Pass Criteria:** `result.status === 'ng'` AND `result.headroomBytes < 0`

**Test Code:**

```typescript
it('TC-002: 405B on 36GB => ng', () => {
  const model = {
    id: 'llama-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    parameterCount: 405_000_000_000,
    quantization: 'Q4_K_M',
    requiredRAMBytes: 236_223_201_280,
    contextLengthOptions: [
      { tokens: 4096, requiredRAMBytes: 236_223_201_280 },
    ],
  };

  const result = assessCompatibility(
    model,
    { totalRAMBytes: 38_654_705_664 },
    { freeRAMBytes: 30_000_000_000 },
    1,
    4096
  );

  expect(result.status).toBe('ng');
  expect(result.headroomBytes).toBeLessThan(0);
});
```

---

### TC-003: Parallel Agents Increase => Headroom Decrease

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-003 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Must |
| **Description** | Verify that increasing the number of parallel agents reduces available headroom |

**Input (Series):**

| Run | parallelAgents | All other params same as TC-001 |
| --- | --- | --- |
| A | 1 | Phi-3 Mini, 36GB, ~27.9GB free |
| B | 3 | Phi-3 Mini, 36GB, ~27.9GB free |
| C | 5 | Phi-3 Mini, 36GB, ~27.9GB free |

**Expected Output:**

| Assertion |
| --- |
| headroom(A) > headroom(B) > headroom(C) |
| All three should still be "ok" (small model, large RAM) |

**Pass Criteria:** Headroom decreases monotonically as parallelAgents increases.

**Test Code:**

```typescript
it('TC-003: parallel agents increase => headroom decrease', () => {
  const model = {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    parameterCount: 3_800_000_000,
    quantization: 'Q4_K_M',
    requiredRAMBytes: 2_684_354_560,
    contextLengthOptions: [
      { tokens: 4096, requiredRAMBytes: 2_684_354_560 },
    ],
  };

  const static_ = { totalRAMBytes: 38_654_705_664 };
  const dynamic_ = { freeRAMBytes: 30_000_000_000 };

  const r1 = assessCompatibility(model, static_, dynamic_, 1, 4096);
  const r3 = assessCompatibility(model, static_, dynamic_, 3, 4096);
  const r5 = assessCompatibility(model, static_, dynamic_, 5, 4096);

  expect(r1.headroomBytes).toBeGreaterThan(r3.headroomBytes);
  expect(r3.headroomBytes).toBeGreaterThan(r5.headroomBytes);
});
```

---

### TC-004: Context Length Increase => Headroom Decrease

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-004 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Must |
| **Description** | Verify that increasing context length reduces available headroom |

**Input (Series):**

| Run | contextLength | requiredRAMBytes at context |
| --- | --- | --- |
| A | 4096 | 2,684,354,560 (2.5GB) |
| B | 8192 | 3,221,225,472 (3.0GB) |
| C | 16384 | 4,294,967,296 (4.0GB) |

**Expected Output:**

| Assertion |
| --- |
| headroom(A) > headroom(B) > headroom(C) |

**Pass Criteria:** Headroom decreases as context length increases.

**Test Code:**

```typescript
it('TC-004: context length increase => headroom decrease', () => {
  const model = {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    parameterCount: 3_800_000_000,
    quantization: 'Q4_K_M',
    requiredRAMBytes: 2_684_354_560,
    contextLengthOptions: [
      { tokens: 4096, requiredRAMBytes: 2_684_354_560 },
      { tokens: 8192, requiredRAMBytes: 3_221_225_472 },
      { tokens: 16384, requiredRAMBytes: 4_294_967_296 },
    ],
  };

  const static_ = { totalRAMBytes: 38_654_705_664 };
  const dynamic_ = { freeRAMBytes: 30_000_000_000 };

  const r4k = assessCompatibility(model, static_, dynamic_, 1, 4096);
  const r8k = assessCompatibility(model, static_, dynamic_, 1, 8192);
  const r16k = assessCompatibility(model, static_, dynamic_, 1, 16384);

  expect(r4k.headroomBytes).toBeGreaterThan(r8k.headroomBytes);
  expect(r8k.headroomBytes).toBeGreaterThan(r16k.headroomBytes);
});
```

---

### TC-005: 16GB RAM Patterns

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-005 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Must |
| **Description** | Verify compatibility classification on a 16GB Mac |

**Input:**

| Parameter | Value |
| --- | --- |
| staticInfo.totalRAMBytes | 17,179,869,184 (16GB) |
| dynamicInfo.freeRAMBytes | 10,000,000,000 (~9.3GB) |

**Test Matrix:**

| Model | requiredRAMBytes | parallelAgents | Expected Status |
| --- | --- | --- | --- |
| Phi-3 Mini (2.5GB) | 2,684,354,560 | 1 | ok |
| Llama 3.1 8B (5.0GB) | 5,368,709,120 | 1 | ok |
| Mistral 7B (4.4GB) | 4,724,464,640 | 2 | ok (headroom > 2GB) |
| Codestral 22B (13.0GB) | 13,958,643,712 | 1 | ng |

**Pass Criteria:** Each model matches its expected status on 16GB hardware.

**Test Code:**

```typescript
it('TC-005: 16GB RAM patterns', () => {
  const static_ = { totalRAMBytes: 17_179_869_184 };
  const dynamic_ = { freeRAMBytes: 10_000_000_000 };

  const phi3 = makeModel('phi-3-mini', 2_684_354_560);
  const llama8b = makeModel('llama-8b', 5_368_709_120);
  const codestral = makeModel('codestral-22b', 13_958_643_712);

  expect(assessCompatibility(phi3, static_, dynamic_, 1, 4096).status).toBe('ok');
  expect(assessCompatibility(llama8b, static_, dynamic_, 1, 4096).status).toBe('ok');
  expect(assessCompatibility(codestral, static_, dynamic_, 1, 4096).status).toBe('ng');
});
```

---

### TC-006: 64GB/128GB RAM Patterns

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-006 |
| **Category** | Unit |
| **Requirement** | FR-003 |
| **Priority** | Should |
| **Description** | Verify compatibility classification on high-RAM Macs (64GB, 128GB) |

**Input - 64GB Mac:**

| Parameter | Value |
| --- | --- |
| staticInfo.totalRAMBytes | 68,719,476,736 (64GB) |
| dynamicInfo.freeRAMBytes | 55,000,000,000 (~51.2GB) |

**Input - 128GB Mac:**

| Parameter | Value |
| --- | --- |
| staticInfo.totalRAMBytes | 137,438,953,472 (128GB) |
| dynamicInfo.freeRAMBytes | 110,000,000,000 (~102.4GB) |

**Test Matrix:**

| RAM | Model | requiredRAMBytes | Expected |
| --- | --- | --- | --- |
| 64GB | Llama 70B (40GB) | 42,949,672,960 | ok |
| 64GB | Llama 405B (220GB) | 236,223,201,280 | ng |
| 128GB | Llama 70B (40GB) | 42,949,672,960 | ok |
| 128GB | Llama 405B (220GB) | 236,223,201,280 | ng |

**Pass Criteria:** Each model matches its expected status for the given RAM configuration.

**Test Code:**

```typescript
it('TC-006: 64GB/128GB RAM patterns', () => {
  const llama70b = makeModel('llama-70b', 42_949_672_960);
  const llama405b = makeModel('llama-405b', 236_223_201_280);

  // 64GB Mac
  const s64 = { totalRAMBytes: 68_719_476_736 };
  const d64 = { freeRAMBytes: 55_000_000_000 };

  expect(assessCompatibility(llama70b, s64, d64, 1, 4096).status).toBe('ok');
  expect(assessCompatibility(llama405b, s64, d64, 1, 4096).status).toBe('ng');

  // 128GB Mac
  const s128 = { totalRAMBytes: 137_438_953_472 };
  const d128 = { freeRAMBytes: 110_000_000_000 };

  expect(assessCompatibility(llama70b, s128, d128, 1, 4096).status).toBe('ok');
  expect(assessCompatibility(llama405b, s128, d128, 1, 4096).status).toBe('ng');
});
```

---

### TC-007: Model Catalog - All Models Have Required Fields

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-007 |
| **Category** | Unit |
| **Requirement** | (Data integrity) |
| **Priority** | Must |
| **Description** | Verify every model in the catalog has all required fields with correct types |

**Input:** Complete model catalog array

**Expected Output:** All models pass schema validation

**Pass Criteria:** For every model in the catalog:
- `id` is a non-empty string
- `name` is a non-empty string
- `provider` is a non-empty string
- `parameterCount` is a positive number
- `quantization` is a non-empty string
- `requiredRAMBytes` is a positive number
- `contextLengthOptions` is a non-empty array

**Test Code:**

```typescript
describe('Model Catalog Validation', () => {
  it('TC-007: all models have required fields', () => {
    for (const model of modelCatalog) {
      expect(model.id).toBeTruthy();
      expect(typeof model.id).toBe('string');
      expect(model.name).toBeTruthy();
      expect(typeof model.name).toBe('string');
      expect(model.provider).toBeTruthy();
      expect(typeof model.provider).toBe('string');
      expect(model.parameterCount).toBeGreaterThan(0);
      expect(typeof model.parameterCount).toBe('number');
      expect(model.quantization).toBeTruthy();
      expect(typeof model.quantization).toBe('string');
      expect(model.requiredRAMBytes).toBeGreaterThan(0);
      expect(model.contextLengthOptions.length).toBeGreaterThan(0);
    }
  });
});
```

---

### TC-008: Model Catalog - requiredRAMBytes > 0

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-008 |
| **Category** | Unit |
| **Requirement** | (Data integrity) |
| **Priority** | Must |
| **Description** | Verify every model has a positive requiredRAMBytes value |

**Pass Criteria:** `model.requiredRAMBytes > 0` for all models

**Test Code:**

```typescript
it('TC-008: requiredRAMBytes > 0 for all models', () => {
  for (const model of modelCatalog) {
    expect(model.requiredRAMBytes).toBeGreaterThan(0);
  }
});
```

---

### TC-009: Model Catalog - contextLengthOptions Non-Empty

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-009 |
| **Category** | Unit |
| **Requirement** | (Data integrity) |
| **Priority** | Must |
| **Description** | Verify every model has at least one context length option |

**Pass Criteria:**
- `model.contextLengthOptions.length >= 1` for all models
- Each option has `tokens > 0` and `requiredRAMBytes > 0`

**Test Code:**

```typescript
it('TC-009: contextLengthOptions non-empty for all models', () => {
  for (const model of modelCatalog) {
    expect(model.contextLengthOptions.length).toBeGreaterThanOrEqual(1);
    for (const opt of model.contextLengthOptions) {
      expect(opt.tokens).toBeGreaterThan(0);
      expect(opt.requiredRAMBytes).toBeGreaterThan(0);
    }
  }
});
```

---

### TC-010: useStaticSystemInfo Mock Data Retrieval

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-010 |
| **Category** | Hook |
| **Requirement** | FR-001 |
| **Priority** | Must |
| **Description** | Verify the hook fetches and returns static system info from the mocked API |

**Preconditions:** Default mock electronAPI is available on `window`

**Expected Behavior:**
1. Hook starts with `loading: true`, `data: null`, `error: null`
2. After resolution, `loading: false`, `data` contains StaticSystemInfo, `error: null`
3. `data.cpuModel` equals `'Apple M3 Pro'`
4. `data.totalRAMBytes` equals `38_654_705_664`

**Pass Criteria:** Hook resolves with expected mock data

**Test Code:**

```typescript
import { renderHook, waitFor } from '@testing-library/react';

describe('useStaticSystemInfo', () => {
  it('TC-010: retrieves mock static info', async () => {
    const { result } = renderHook(() => useStaticSystemInfo());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    // After async resolution
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.cpuModel).toBe('Apple M3 Pro');
    expect(result.current.data!.totalRAMBytes).toBe(38_654_705_664);
    expect(result.current.data!.architecture).toBe('arm64');
    expect(result.current.error).toBeNull();
  });
});
```

---

### TC-011: useDynamicSystemInfo Polling Start/Stop

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-011 |
| **Category** | Hook |
| **Requirement** | FR-007 |
| **Priority** | Must |
| **Description** | Verify the hook starts polling on mount and stops on unmount |

**Preconditions:** Default mock electronAPI with spy-able startPolling and stopPolling

**Expected Behavior:**
1. On mount, `electronAPI.startPolling()` is called
2. On unmount, `electronAPI.stopPolling()` is called
3. Hook initially has `loading: true`

**Pass Criteria:**
- `startPolling` called exactly once on mount
- `stopPolling` called exactly once on unmount

**Test Code:**

```typescript
import { renderHook } from '@testing-library/react';

describe('useDynamicSystemInfo', () => {
  it('TC-011: starts polling on mount, stops on unmount', () => {
    const startSpy = vi.fn();
    const stopSpy = vi.fn();
    const onUpdateSpy = vi.fn();

    window.electronAPI = {
      ...window.electronAPI!,
      startPolling: startSpy,
      stopPolling: stopSpy,
      onMetricsUpdate: onUpdateSpy,
    };

    const { unmount } = renderHook(() => useDynamicSystemInfo());

    // startPolling called on mount
    expect(startSpy).toHaveBeenCalledTimes(1);

    // onMetricsUpdate registered
    expect(onUpdateSpy).toHaveBeenCalledTimes(1);

    // Unmount
    unmount();

    // stopPolling called on unmount
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

### TC-012: API Absent Fallback Behavior

| Attribute | Value |
| --- | --- |
| **TC ID** | TC-012 |
| **Category** | Hook |
| **Requirement** | NFR-004 |
| **Priority** | Must |
| **Description** | Verify hooks degrade gracefully when window.electronAPI is undefined |

**Preconditions:** `window.electronAPI` is set to `undefined`

**Expected Behavior:**
1. No runtime errors or exceptions thrown
2. Hook returns fallback/mock data (not null crash)
3. `loading` eventually becomes `false`
4. `error` is `null` (graceful fallback, not error state)

**Pass Criteria:**
- No uncaught exceptions
- Hook returns usable data object

**Test Code:**

```typescript
describe('Fallback behavior (NFR-004)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'electronAPI', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it('TC-012: useStaticSystemInfo does not crash without API', async () => {
    const { result } = renderHook(() => useStaticSystemInfo());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return fallback data, not crash
    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();
    // Fallback data should have expected shape
    expect(result.current.data).toHaveProperty('cpuModel');
    expect(result.current.data).toHaveProperty('totalRAMBytes');
  });

  it('TC-012b: useDynamicSystemInfo does not crash without API', async () => {
    const { result } = renderHook(() => useDynamicSystemInfo());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    // data may be mock/placeholder but should not be undefined
    expect(result.current.data).not.toBeUndefined();
  });

  it('TC-012c: useProcesses does not crash without API', async () => {
    const { result } = renderHook(() => useProcesses());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.processes)).toBe(true);
  });
});
```

---

## 4. Test Helper Functions

```typescript
// tests/helpers.ts

import type { LLMModel } from '@/lib/types';

/**
 * Create a minimal LLM model for testing.
 */
export function makeModel(
  id: string,
  requiredRAMBytes: number,
  contextOptions?: { tokens: number; requiredRAMBytes: number }[]
): LLMModel {
  return {
    id,
    name: id,
    provider: 'Test',
    parameterCount: 1_000_000_000,
    quantization: 'Q4_K_M',
    requiredRAMBytes,
    contextLengthOptions: contextOptions ?? [
      { tokens: 4096, requiredRAMBytes },
    ],
  };
}
```

---

## 5. Test Execution Summary Template

| TC ID | Status | Date | Tester | Notes |
| --- | --- | --- | --- | --- |
| TC-001 | [ ] Pass / [ ] Fail | | | |
| TC-002 | [ ] Pass / [ ] Fail | | | |
| TC-003 | [ ] Pass / [ ] Fail | | | |
| TC-004 | [ ] Pass / [ ] Fail | | | |
| TC-005 | [ ] Pass / [ ] Fail | | | |
| TC-006 | [ ] Pass / [ ] Fail | | | |
| TC-007 | [ ] Pass / [ ] Fail | | | |
| TC-008 | [ ] Pass / [ ] Fail | | | |
| TC-009 | [ ] Pass / [ ] Fail | | | |
| TC-010 | [ ] Pass / [ ] Fail | | | |
| TC-011 | [ ] Pass / [ ] Fail | | | |
| TC-012 | [ ] Pass / [ ] Fail | | | |

---

## 6. Traceability Matrix (Test to Requirement)

| TC ID | Requirement ID | Requirement Name | Design Reference |
| --- | --- | --- | --- |
| TC-001 | FR-003 | LLM Compatibility Detection | 05_DD Section 3 |
| TC-002 | FR-003 | LLM Compatibility Detection | 05_DD Section 3 |
| TC-003 | FR-003 | LLM Compatibility Detection | 05_DD Section 3.3 |
| TC-004 | FR-003 | LLM Compatibility Detection | 05_DD Section 3.1 |
| TC-005 | FR-003 | LLM Compatibility Detection | 05_DD Section 3 |
| TC-006 | FR-003 | LLM Compatibility Detection | 05_DD Section 3 |
| TC-007 | - | Model Catalog Integrity | 05_DD Section 2.3 |
| TC-008 | - | Model Catalog Integrity | 05_DD Section 2.3 |
| TC-009 | - | Model Catalog Integrity | 05_DD Section 2.3 |
| TC-010 | FR-001 | System Info Retrieval | 05_DD Section 4.1 |
| TC-011 | FR-007 | Dynamic Metrics Polling | 05_DD Section 4.2 |
| TC-012 | NFR-004 | Graceful Fallback | 05_DD Section 7.2 |

---
---

## 日本語版 (Japanese)

# 07 - テスト仕様書

| 項目           | 値                                                     |
| -------------- | ------------------------------------------------------ |
| 文書ID         | TS-001                                                 |
| プロジェクト   | Secure Agent OS / OpenNeo                              |
| バージョン     | 1.0                                                    |
| 日付           | 2026-02-22                                             |
| 作成者         | OpenNeo エンジニアリングチーム                          |
| ステータス     | ドラフト                                               |
| 入力元         | 03_要件定義書, 05_詳細設計書, 06_テスト計画書           |
| 出力先         | (テスト実行報告書)                                     |

---

### 1. テストケース一覧

| TC ID | カテゴリ | 要件 | 説明 |
| --- | --- | --- | --- |
| TC-001 | ユニット | FR-003 | Phi-3 Mini on 36GB => ok |
| TC-002 | ユニット | FR-003 | 405B on 36GB => ng |
| TC-003 | ユニット | FR-003 | 並列エージェント増加 => ヘッドルーム減少 |
| TC-004 | ユニット | FR-003 | コンテキスト長増加 => ヘッドルーム減少 |
| TC-005 | ユニット | FR-003 | 16GB RAM パターン |
| TC-006 | ユニット | FR-003 | 64GB/128GB RAM パターン |
| TC-007 | ユニット | - | モデルカタログ：全モデルが必須フィールドを持つ |
| TC-008 | ユニット | - | モデルカタログ：requiredRAMBytes > 0 |
| TC-009 | ユニット | - | モデルカタログ：contextLengthOptions が非空 |
| TC-010 | フック | FR-001 | useStaticSystemInfo モックデータ取得 |
| TC-011 | フック | FR-007 | useDynamicSystemInfo ポーリング開始/停止 |
| TC-012 | フック | NFR-004 | API不在時のフォールバック動作 |

---

### 2. モック戦略

#### 2.1 デフォルトモック環境

全テストは `tests/setup.ts` で定義されたデフォルトモックを使用します。**36GB M3 Pro** Mac をシミュレートします。

主要モック値：
- `totalRAMBytes`: 38,654,705,664 (36GB)
- `freeRAMBytes`: 30,000,000,000 (~27.9GB空き)
- `cpuModel`: "Apple M3 Pro"
- `architecture`: "arm64"

#### 2.2 モックオーバーライドパターン

個別テストでは特定メソッドをオーバーライド可能：

```typescript
beforeEach(() => {
  window.electronAPI = {
    ...window.electronAPI!,
    getStaticInfo: async () => ({ ...defaultData, totalRAMBytes: 17_179_869_184 }),
  };
});
```

#### 2.3 API不在モック

NFR-004 フォールバックテスト用：

```typescript
beforeEach(() => {
  Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true });
});
```

---

### 3. 詳細テストケース

#### TC-001: Phi-3 Mini on 36GB => ok

- **入力**: requiredRAMBytes=2.5GB, freeRAMBytes=~27.9GB, 1エージェント
- **期待出力**: status="ok", headroomBytes >= 2GB
- **合否基準**: `result.status === 'ok'` かつ `result.headroomBytes >= 2,147,483,648`

#### TC-002: 405B on 36GB => ng

- **入力**: requiredRAMBytes=~220GB, freeRAMBytes=~27.9GB, 1エージェント
- **期待出力**: status="ng", headroomBytes < 0
- **合否基準**: `result.status === 'ng'` かつ `result.headroomBytes < 0`

#### TC-003: 並列エージェント増加 => ヘッドルーム減少

- **入力**: 同一モデルで parallelAgents を 1, 3, 5 と変化
- **期待出力**: headroom(1) > headroom(3) > headroom(5)
- **合否基準**: ヘッドルームが単調減少

#### TC-004: コンテキスト長増加 => ヘッドルーム減少

- **入力**: 同一モデルで contextLength を 4096, 8192, 16384 と変化
- **期待出力**: headroom(4096) > headroom(8192) > headroom(16384)
- **合否基準**: ヘッドルームが単調減少

#### TC-005: 16GB RAM パターン

- **入力**: totalRAMBytes=16GB, freeRAMBytes=~9.3GB
- **期待出力**: Phi-3 Mini => ok, Codestral 22B => ng
- **合否基準**: 各モデルが期待ステータスと一致

#### TC-006: 64GB/128GB RAM パターン

- **入力**: 64GB/128GB環境でLlama 70B, 405Bを評価
- **期待出力**: 70B => ok, 405B => ng（両環境とも）
- **合否基準**: 各モデルが期待ステータスと一致

#### TC-007: モデルカタログ - 全モデルが必須フィールドを持つ

- **入力**: モデルカタログ全体
- **合否基準**: 全モデルで id, name, provider, parameterCount, quantization, requiredRAMBytes, contextLengthOptions が存在かつ正しい型

#### TC-008: モデルカタログ - requiredRAMBytes > 0

- **合否基準**: `model.requiredRAMBytes > 0`（全モデル）

#### TC-009: モデルカタログ - contextLengthOptions が非空

- **合否基準**: `model.contextLengthOptions.length >= 1`（全モデル）、各オプションの tokens > 0 かつ requiredRAMBytes > 0

#### TC-010: useStaticSystemInfo モックデータ取得

- **前提条件**: デフォルトモック electronAPI が window に存在
- **期待動作**: loading: true → false、data に StaticSystemInfo が入る
- **合否基準**: `data.cpuModel === 'Apple M3 Pro'` かつ `data.totalRAMBytes === 38,654,705,664`

#### TC-011: useDynamicSystemInfo ポーリング開始/停止

- **前提条件**: startPolling, stopPolling, onMetricsUpdate がスパイ化されたモック
- **期待動作**: マウント時に startPolling 呼出、アンマウント時に stopPolling 呼出
- **合否基準**: startPolling が1回呼出、stopPolling が1回呼出

#### TC-012: API不在フォールバック動作

- **前提条件**: `window.electronAPI` が `undefined`
- **期待動作**: 例外なし、フォールバックデータを返す
- **合否基準**: エラーなし、loading が false になる、data が null/undefined でない

---

### 4. トレーサビリティマトリクス（テストから要件へ）

| TC ID | 要件ID | 要件名 | 設計参照 |
| --- | --- | --- | --- |
| TC-001 | FR-003 | LLM互換性検出 | 05_DD セクション 3 |
| TC-002 | FR-003 | LLM互換性検出 | 05_DD セクション 3 |
| TC-003 | FR-003 | LLM互換性検出 | 05_DD セクション 3.3 |
| TC-004 | FR-003 | LLM互換性検出 | 05_DD セクション 3.1 |
| TC-005 | FR-003 | LLM互換性検出 | 05_DD セクション 3 |
| TC-006 | FR-003 | LLM互換性検出 | 05_DD セクション 3 |
| TC-007 | - | モデルカタログ整合性 | 05_DD セクション 2.3 |
| TC-008 | - | モデルカタログ整合性 | 05_DD セクション 2.3 |
| TC-009 | - | モデルカタログ整合性 | 05_DD セクション 2.3 |
| TC-010 | FR-001 | システム情報取得 | 05_DD セクション 4.1 |
| TC-011 | FR-007 | 動的メトリクスポーリング | 05_DD セクション 4.2 |
| TC-012 | NFR-004 | グレースフルフォールバック | 05_DD セクション 7.2 |

---

### 5. テスト実行サマリテンプレート

| TC ID | ステータス | 日付 | テスター | 備考 |
| --- | --- | --- | --- | --- |
| TC-001 | [ ] 合格 / [ ] 不合格 | | | |
| TC-002 | [ ] 合格 / [ ] 不合格 | | | |
| TC-003 | [ ] 合格 / [ ] 不合格 | | | |
| TC-004 | [ ] 合格 / [ ] 不合格 | | | |
| TC-005 | [ ] 合格 / [ ] 不合格 | | | |
| TC-006 | [ ] 合格 / [ ] 不合格 | | | |
| TC-007 | [ ] 合格 / [ ] 不合格 | | | |
| TC-008 | [ ] 合格 / [ ] 不合格 | | | |
| TC-009 | [ ] 合格 / [ ] 不合格 | | | |
| TC-010 | [ ] 合格 / [ ] 不合格 | | | |
| TC-011 | [ ] 合格 / [ ] 不合格 | | | |
| TC-012 | [ ] 合格 / [ ] 不合格 | | | |
