# 05 - Detailed Design

| Field          | Value                                              |
| -------------- | -------------------------------------------------- |
| Document ID    | DD-001                                             |
| Project        | Secure Agent OS / OpenNeo                          |
| Version        | 1.0                                                |
| Date           | 2026-02-22                                         |
| Author         | OpenNeo Engineering Team                           |
| Status         | Draft                                              |
| Traces From    | 03_Requirements_Specification, 04_High_Level_Design |
| Traces To      | 06_Test_Plan, 07_Test_Specification                |

---

## 1. IPC Channel Interface Specifications

### 1.1 system:get-static-info

| Property | Value |
| --- | --- |
| Channel | `system:get-static-info` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | (none) |
| Response | `StaticSystemInfo` |
| Requirement | FR-001 |

```typescript
// Main Process Handler
ipcMain.handle('system:get-static-info', async (): Promise<StaticSystemInfo> => {
  return systemInfo.getStaticInfo();
});
```

---

### 1.2 system:get-dynamic-info

| Property | Value |
| --- | --- |
| Channel | `system:get-dynamic-info` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | (none) |
| Response | `DynamicSystemInfo` |
| Requirement | FR-002, FR-007 |

```typescript
ipcMain.handle('system:get-dynamic-info', async (): Promise<DynamicSystemInfo> => {
  return systemInfo.getDynamicInfo();
});
```

---

### 1.3 system:get-processes

| Property | Value |
| --- | --- |
| Channel | `system:get-processes` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | (none) |
| Response | `ProcessInfo[]` |
| Requirement | FR-004 |

```typescript
ipcMain.handle('system:get-processes', async (): Promise<ProcessInfo[]> => {
  return systemInfo.getProcesses();
});
```

---

### 1.4 system:get-battery

| Property | Value |
| --- | --- |
| Channel | `system:get-battery` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | (none) |
| Response | `BatteryInfo` |
| Requirement | FR-006 |

```typescript
ipcMain.handle('system:get-battery', async (): Promise<BatteryInfo> => {
  return systemInfo.getBattery();
});
```

---

### 1.5 system:start-polling

| Property | Value |
| --- | --- |
| Channel | `system:start-polling` |
| Direction | Renderer -> Main |
| Pattern | send / on |
| Request | (none) |
| Response | (none - triggers metrics-update events) |
| Requirement | FR-007 |

```typescript
let pollingInterval: NodeJS.Timeout | null = null;

ipcMain.on('system:start-polling', (event) => {
  if (pollingInterval) return; // Prevent duplicate intervals

  pollingInterval = setInterval(async () => {
    const metrics = await systemInfo.getDynamicInfo();
    event.sender.send('system:metrics-update', metrics);
  }, 3000);
});
```

---

### 1.6 system:stop-polling

| Property | Value |
| --- | --- |
| Channel | `system:stop-polling` |
| Direction | Renderer -> Main |
| Pattern | send / on |
| Request | (none) |
| Response | (none) |
| Requirement | FR-007 |

```typescript
ipcMain.on('system:stop-polling', () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
});
```

---

### 1.7 system:metrics-update

| Property | Value |
| --- | --- |
| Channel | `system:metrics-update` |
| Direction | Main -> Renderer |
| Pattern | send / on (event push) |
| Payload | `DynamicSystemInfo` |
| Requirement | FR-002, FR-007 |

```typescript
// Preload (receiving side)
onMetricsUpdate: (callback: (data: DynamicSystemInfo) => void) => {
  ipcRenderer.on('system:metrics-update', (_event, data) => callback(data));
}
```

---

### 1.8 system:kill-process

| Property | Value |
| --- | --- |
| Channel | `system:kill-process` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | `{ pid: number }` |
| Response | `KillProcessResult` |
| Requirement | FR-004 |

```typescript
ipcMain.handle('system:kill-process', async (_event, { pid }: { pid: number }): Promise<KillProcessResult> => {
  try {
    process.kill(pid, 'SIGTERM');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
});
```

---

### 1.9 app:get-login-item-settings

| Property | Value |
| --- | --- |
| Channel | `app:get-login-item-settings` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | (none) |
| Response | `LoginItemSettings` |
| Requirement | FR-005 |

```typescript
ipcMain.handle('app:get-login-item-settings', async (): Promise<LoginItemSettings> => {
  const settings = app.getLoginItemSettings();
  return { openAtLogin: settings.openAtLogin };
});
```

---

### 1.10 app:set-login-item-settings

| Property | Value |
| --- | --- |
| Channel | `app:set-login-item-settings` |
| Direction | Renderer -> Main |
| Pattern | invoke / handle |
| Request | `{ openAtLogin: boolean }` |
| Response | `LoginItemSettings` |
| Requirement | FR-005 |

```typescript
ipcMain.handle('app:set-login-item-settings', async (_event, { openAtLogin }: { openAtLogin: boolean }): Promise<LoginItemSettings> => {
  app.setLoginItemSettings({ openAtLogin });
  return { openAtLogin };
});
```

---

## 2. TypeScript Type Definitions

### 2.1 System Information Types

```typescript
/**
 * Static hardware and OS information that does not change during runtime.
 * Retrieved once and cached until explicit refresh.
 */
export interface StaticSystemInfo {
  /** CPU model string, e.g., "Apple M3 Pro" */
  cpuModel: string;

  /** Parsed chip generation, e.g., "M3 Pro" */
  chipGeneration: string;

  /** Number of GPU cores */
  gpuCores: number;

  /** Total physical RAM in bytes */
  totalRAMBytes: number;

  /** Total disk capacity in bytes */
  diskTotalBytes: number;

  /** Currently free disk space in bytes */
  diskFreeBytes: number;

  /** macOS version string, e.g., "15.3" */
  osVersion: string;

  /** CPU architecture, e.g., "arm64" */
  architecture: string;
}

/**
 * Dynamic system metrics that change over time.
 * Retrieved via polling at FR-007 interval.
 */
export interface DynamicSystemInfo {
  /** Currently free RAM in bytes */
  freeRAMBytes: number;

  /** Memory pressure level */
  memoryPressure: 'normal' | 'warn' | 'critical';

  /** Current CPU load as a percentage (0-100) */
  cpuLoadPercent: number;

  /** Currently free disk space in bytes */
  diskFreeBytes: number;

  /** Timestamp of this measurement (ISO 8601) */
  timestamp: string;
}

/**
 * Information about a running process.
 */
export interface ProcessInfo {
  /** Process ID */
  pid: number;

  /** Parent process ID */
  ppid: number;

  /** CPU usage percentage */
  cpuPercent: number;

  /** Resident memory usage in bytes */
  ramBytes: number;

  /** Process command name */
  command: string;
}

/**
 * Battery status information.
 */
export interface BatteryInfo {
  /** Battery charge percentage (0-100) */
  percent: number;

  /** Whether the device is currently charging */
  charging: boolean;

  /**
   * Estimated time remaining in minutes.
   * -1 = calculating
   * -2 = connected to power (not applicable)
   */
  timeRemaining: number;
}

/**
 * Login item settings for the application.
 */
export interface LoginItemSettings {
  /** Whether the app is set to open at login */
  openAtLogin: boolean;
}

/**
 * Result of a process kill operation.
 */
export interface KillProcessResult {
  /** Whether the kill signal was sent successfully */
  success: boolean;

  /** Error message if the operation failed */
  error?: string;
}
```

### 2.2 ElectronAPI Interface

```typescript
/**
 * The API surface exposed to the renderer process via contextBridge.
 * Available as window.electronAPI in the renderer.
 */
export interface ElectronAPI {
  /** Platform identifier (always 'darwin' for macOS) */
  platform: string;

  /** Retrieve static hardware and OS information */
  getStaticInfo: () => Promise<StaticSystemInfo>;

  /** Retrieve current dynamic system metrics */
  getDynamicInfo: () => Promise<DynamicSystemInfo>;

  /** Retrieve list of running processes */
  getProcesses: () => Promise<ProcessInfo[]>;

  /** Retrieve battery status */
  getBattery: () => Promise<BatteryInfo>;

  /** Terminate a process by PID */
  killProcess: (pid: number) => Promise<KillProcessResult>;

  /** Start dynamic metrics polling (3s interval) */
  startPolling: () => void;

  /** Stop dynamic metrics polling */
  stopPolling: () => void;

  /** Register callback for polling metric updates */
  onMetricsUpdate: (callback: (data: DynamicSystemInfo) => void) => void;

  /** Get current login item settings */
  getLoginItemSettings: () => Promise<LoginItemSettings>;

  /** Set login item settings */
  setLoginItemSettings: (openAtLogin: boolean) => Promise<LoginItemSettings>;
}

/**
 * Augment the Window interface to include electronAPI.
 */
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
```

### 2.3 LLM Model Types

```typescript
/**
 * A model in the LLM catalog.
 */
export interface LLMModel {
  /** Unique model identifier */
  id: string;

  /** Display name */
  name: string;

  /** Model provider (e.g., "Meta", "Microsoft", "Google") */
  provider: string;

  /** Number of parameters (e.g., 3_800_000_000 for 3.8B) */
  parameterCount: number;

  /** Quantization level (e.g., "Q4_K_M", "Q5_K_S", "F16") */
  quantization: string;

  /** RAM required for base context length, in bytes */
  requiredRAMBytes: number;

  /** Available context length options */
  contextLengthOptions: ContextLengthOption[];
}

/**
 * A context length option with its associated RAM requirement.
 */
export interface ContextLengthOption {
  /** Context length in tokens */
  tokens: number;

  /** RAM required at this context length, in bytes */
  requiredRAMBytes: number;
}

/**
 * Compatibility assessment result.
 */
export type CompatibilityStatus = 'ok' | 'heavy' | 'ng';

/**
 * Full compatibility result for a model.
 */
export interface CompatibilityResult {
  /** The model assessed */
  modelId: string;

  /** Compatibility status */
  status: CompatibilityStatus;

  /** Available headroom in bytes (negative = deficit) */
  headroomBytes: number;

  /** Effective RAM used in calculation */
  effectiveRAMBytes: number;
}
```

---

## 3. LLM Compatibility Algorithm

### 3.1 Algorithm Specification

```typescript
/**
 * Assess LLM compatibility with current hardware.
 *
 * @param model - The LLM model to assess
 * @param staticInfo - Static system information (totalRAMBytes)
 * @param dynamicInfo - Dynamic system information (freeRAMBytes)
 * @param parallelAgents - Number of concurrent agents (default: 1)
 * @param contextLength - Selected context length in tokens
 * @returns CompatibilityResult with status and headroom
 */
export function assessCompatibility(
  model: LLMModel,
  staticInfo: Pick<StaticSystemInfo, 'totalRAMBytes'>,
  dynamicInfo: Pick<DynamicSystemInfo, 'freeRAMBytes'>,
  parallelAgents: number = 1,
  contextLength: number = model.contextLengthOptions[0].tokens
): CompatibilityResult {
  // 1. Determine required RAM for selected context length
  const contextOption = model.contextLengthOptions.find(
    (opt) => opt.tokens === contextLength
  );
  const requiredRAM = contextOption?.requiredRAMBytes ?? model.requiredRAMBytes;

  // 2. Calculate effective RAM (accounting for parallel agent overhead)
  //    Each additional agent beyond the first consumes 30% of model RAM
  const parallelOverhead = (parallelAgents - 1) * requiredRAM * 0.3;
  const effectiveRAM = dynamicInfo.freeRAMBytes - parallelOverhead;

  // 3. Calculate headroom
  const headroomBytes = effectiveRAM - requiredRAM;

  // 4. Classify
  const TWO_GB = 2 * 1024 * 1024 * 1024; // 2,147,483,648 bytes
  let status: CompatibilityStatus;

  if (headroomBytes >= TWO_GB) {
    status = 'ok';
  } else if (headroomBytes >= 0) {
    status = 'heavy';
  } else {
    status = 'ng';
  }

  return {
    modelId: model.id,
    status,
    headroomBytes,
    effectiveRAMBytes: effectiveRAM,
  };
}
```

### 3.2 Algorithm Walkthrough Example

**Scenario:** Phi-3 Mini (3.8B Q4) on 36GB M3 Pro Mac

```
Input:
  model.requiredRAMBytes = 2,684,354,560  (2.5 GB)
  staticInfo.totalRAMBytes = 38,654,705,664  (36 GB)
  dynamicInfo.freeRAMBytes = 30,000,000,000  (~27.9 GB free)
  parallelAgents = 1
  contextLength = 4096

Step 1: requiredRAM = 2,684,354,560
Step 2: parallelOverhead = (1 - 1) * 2,684,354,560 * 0.3 = 0
         effectiveRAM = 30,000,000,000 - 0 = 30,000,000,000
Step 3: headroomBytes = 30,000,000,000 - 2,684,354,560 = 27,315,645,440
Step 4: 27,315,645,440 >= 2,147,483,648 => status = "ok"

Result: { status: "ok", headroomBytes: 27,315,645,440 }
```

**Scenario:** Llama 405B (Q4) on 36GB M3 Pro Mac

```
Input:
  model.requiredRAMBytes = 236,223,201,280  (~220 GB)
  dynamicInfo.freeRAMBytes = 30,000,000,000  (~27.9 GB free)
  parallelAgents = 1

Step 1: requiredRAM = 236,223,201,280
Step 2: effectiveRAM = 30,000,000,000
Step 3: headroomBytes = 30,000,000,000 - 236,223,201,280 = -206,223,201,280
Step 4: -206,223,201,280 < 0 => status = "ng"

Result: { status: "ng", headroomBytes: -206,223,201,280 }
```

### 3.3 Parallel Agent Impact

```
Base: 1 agent, Phi-3 Mini, 30GB free
  effectiveRAM = 30GB - 0 = 30GB
  headroom = 30GB - 2.5GB = 27.5GB => "ok"

2 agents:
  effectiveRAM = 30GB - (1 * 2.5GB * 0.3) = 30GB - 0.75GB = 29.25GB
  headroom = 29.25GB - 2.5GB = 26.75GB => "ok"

5 agents:
  effectiveRAM = 30GB - (4 * 2.5GB * 0.3) = 30GB - 3.0GB = 27.0GB
  headroom = 27.0GB - 2.5GB = 24.5GB => "ok"

10 agents:
  effectiveRAM = 30GB - (9 * 2.5GB * 0.3) = 30GB - 6.75GB = 23.25GB
  headroom = 23.25GB - 2.5GB = 20.75GB => "ok"
```

---

## 4. React Hook Signatures

### 4.1 useStaticSystemInfo

```typescript
/**
 * Hook to retrieve static system information.
 * Fetches once on mount and provides manual refetch capability.
 *
 * @returns Object with data, loading state, error, and refetch function
 */
export function useStaticSystemInfo(): {
  /** Static system info data, null if not yet loaded */
  data: StaticSystemInfo | null;

  /** Whether the initial fetch is in progress */
  loading: boolean;

  /** Error object if fetch failed */
  error: Error | null;

  /** Function to manually re-fetch static info */
  refetch: () => Promise<void>;
} {
  // Implementation:
  // 1. Check if window.electronAPI is available
  // 2. If yes: call electronAPI.getStaticInfo() on mount
  // 3. If no: return mock data from lib/mockData.ts (NFR-004)
  // 4. Store result in state
  // 5. Provide refetch that re-calls the API
}
```

### 4.2 useDynamicSystemInfo

```typescript
/**
 * Hook to subscribe to dynamic system metrics with polling.
 * Starts polling on mount, stops on unmount.
 *
 * @param interval - Polling interval in ms (default: 3000)
 * @returns Object with current data, loading state, and error
 */
export function useDynamicSystemInfo(interval?: number): {
  /** Latest dynamic system info, null if not yet received */
  data: DynamicSystemInfo | null;

  /** Whether waiting for first metric update */
  loading: boolean;

  /** Error object if subscription failed */
  error: Error | null;
} {
  // Implementation:
  // 1. Check if window.electronAPI is available
  // 2. If yes:
  //    a. Call electronAPI.startPolling() on mount
  //    b. Register electronAPI.onMetricsUpdate(callback)
  //    c. Call electronAPI.stopPolling() on unmount (cleanup)
  // 3. If no: return static mock data (NFR-004)
  // 4. Update state on each metrics-update event
}
```

### 4.3 useProcesses

```typescript
/**
 * Hook to manage process list and kill operations.
 * Fetches process list on mount and at specified interval.
 *
 * @param interval - Refresh interval in ms (default: 5000)
 * @returns Object with processes, loading state, error, and kill function
 */
export function useProcesses(interval?: number): {
  /** Array of running processes */
  processes: ProcessInfo[];

  /** Whether the process list is loading */
  loading: boolean;

  /** Error object if fetch failed */
  error: Error | null;

  /**
   * Kill a process by PID.
   * @param pid - Process ID to terminate
   * @returns Kill operation result
   */
  killProcess: (pid: number) => Promise<KillProcessResult>;
} {
  // Implementation:
  // 1. Check if window.electronAPI is available
  // 2. If yes: call electronAPI.getProcesses() on mount and interval
  // 3. If no: return mock process list (NFR-004)
  // 4. killProcess wraps electronAPI.killProcess(pid) and refreshes list
}
```

### 4.4 useBattery

```typescript
/**
 * Hook to monitor battery status.
 * Updates with dynamic metrics polling.
 *
 * @param interval - Refresh interval in ms (default: 3000)
 * @returns Object with battery data, loading state, and error
 */
export function useBattery(interval?: number): {
  /** Battery info data, null if not yet loaded */
  data: BatteryInfo | null;

  /** Whether battery info is loading */
  loading: boolean;

  /** Error object if fetch failed */
  error: Error | null;
} {
  // Implementation:
  // 1. Check if window.electronAPI is available
  // 2. If yes: call electronAPI.getBattery() on mount and interval
  // 3. If no: return mock battery data (NFR-004)
}
```

### 4.5 useLoginItem

```typescript
/**
 * Hook to manage the Open at Login setting.
 * Fetches current state on mount and provides toggle function.
 *
 * @returns Object with settings, loading state, and toggle function
 */
export function useLoginItem(): {
  /** Current login item settings, null if not yet loaded */
  settings: LoginItemSettings | null;

  /** Whether settings are loading */
  loading: boolean;

  /**
   * Toggle the Open at Login setting.
   * @returns Updated settings after toggle
   */
  toggle: () => Promise<LoginItemSettings | undefined>;
} {
  // Implementation:
  // 1. Check if window.electronAPI is available
  // 2. If yes: call electronAPI.getLoginItemSettings() on mount
  // 3. If no: return mock settings with toggle disabled (NFR-004)
  // 4. toggle() calls electronAPI.setLoginItemSettings(!current)
}
```

---

## 5. UI Wireframes

### 5.1 System Dashboard Page Layout

```
+============================================================================+
|  [<] [O] [>]    OpenNeo                                  [Theme] [User]   |
+============================================================================+
|            |                                                               |
|  SIDEBAR   |  SYSTEM OVERVIEW                                             |
|  --------  |  ===============                                             |
|            |                                                               |
|  > System  |  +----------------------------+  +-------------------------+ |
|    Models   |  | HARDWARE INFO              |  | MEMORY PRESSURE         | |
|    Agents   |  |                            |  |                         | |
|    Policies |  | CPU:  Apple M3 Pro         |  |  [=========>    ]  72%  | |
|    Audit    |  | GPU:  18 cores             |  |  Status: Normal         | |
|    Jobs     |  | RAM:  36 GB                |  |  Free: 10.1 GB          | |
|    Network  |  | Disk: 512 GB (312 GB free) |  |                         | |
|    Creds    |  | OS:   macOS 15.3           |  | CPU Load: 23%           | |
|    Requests |  | Arch: arm64                |  |  [=====>          ] 23% | |
|            |  +----------------------------+  +-------------------------+ |
|            |                                                               |
|            |  +----------------------------+  +-------------------------+ |
|            |  | BATTERY                    |  | LOGIN SETTINGS          | |
|            |  |                            |  |                         | |
|            |  | [===========>      ]  67%  |  | Open at Login:  [ON]    | |
|            |  | Discharging                |  |                         | |
|            |  | ~3h 42m remaining          |  |                         | |
|            |  +----------------------------+  +-------------------------+ |
|            |                                                               |
|            |  RUNNING PROCESSES                                           |
|            |  =================                                           |
|            |                                                               |
|            |  +----------------------------------------------------------+|
|            |  | PID   | PPID  | CPU%  | RAM      | Command    | Action  ||
|            |  |-------|-------|-------|----------|------------|---------|  |
|            |  | 1234  | 1     | 12.3% | 456 MB   | node       | [Kill]  ||
|            |  | 5678  | 1234  |  3.1% | 128 MB   | electron   | [Kill]  ||
|            |  | 9012  | 1     |  0.5% |  64 MB   | Finder     | [Kill]  ||
|            |  | ...   | ...   | ...   | ...      | ...        | ...     ||
|            |  +----------------------------------------------------------+|
|            |                                                               |
+============================================================================+
```

### 5.2 Models Page Layout

```
+============================================================================+
|  [<] [O] [>]    OpenNeo                                  [Theme] [User]   |
+============================================================================+
|            |                                                               |
|  SIDEBAR   |  LLM COMPATIBILITY                                          |
|  --------  |  ==================                                          |
|            |                                                               |
|  System    |  Hardware: Apple M3 Pro | 36 GB RAM | 28.5 GB Free           |
|  > Models  |                                                               |
|    Agents   |  +----------------------------------------------------------+|
|    Policies |  | PARAMETERS                                              ||
|    Audit    |  |                                                          ||
|    ...     |  | Parallel Agents: [--*------] 2                            ||
|            |  | Context Length:   [4096  v]                                ||
|            |  +----------------------------------------------------------+|
|            |                                                               |
|            |  +----------------------------------------------------------+|
|            |  | MODEL CATALOG                                            ||
|            |  |                                                          ||
|            |  | Status | Model              | Params | Quant | RAM Req  ||
|            |  |--------|--------------------+--------+-------+----------||
|            |  | [OK]   | Phi-3 Mini 3.8B    | 3.8B   | Q4    |  2.5 GB  ||
|            |  | [OK]   | Llama 3.2 3B       | 3B     | Q4    |  2.1 GB  ||
|            |  | [OK]   | Mistral 7B         | 7B     | Q4    |  4.4 GB  ||
|            |  | [OK]   | Llama 3.1 8B       | 8B     | Q4    |  5.0 GB  ||
|            |  | [HEAVY]| Codestral 22B      | 22B    | Q4    | 13.0 GB  ||
|            |  | [HEAVY]| Llama 3.1 70B      | 70B    | Q4    | 40.0 GB  ||
|            |  | [NG]   | Llama 3.1 405B     | 405B   | Q4    | 220 GB   ||
|            |  +----------------------------------------------------------+|
|            |                                                               |
+============================================================================+
```

---

## 6. Preload Script Full Implementation

```typescript
// electron/preload.js (target implementation)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Platform
  platform: process.platform,

  // System Information (FR-001)
  getStaticInfo: () => ipcRenderer.invoke('system:get-static-info'),

  // Dynamic Metrics (FR-002, FR-007)
  getDynamicInfo: () => ipcRenderer.invoke('system:get-dynamic-info'),

  // Process Management (FR-004)
  getProcesses: () => ipcRenderer.invoke('system:get-processes'),
  killProcess: (pid: number) => ipcRenderer.invoke('system:kill-process', { pid }),

  // Battery (FR-006)
  getBattery: () => ipcRenderer.invoke('system:get-battery'),

  // Polling (FR-007)
  startPolling: () => ipcRenderer.send('system:start-polling'),
  stopPolling: () => ipcRenderer.send('system:stop-polling'),
  onMetricsUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('system:metrics-update', (_event: any, data: any) => callback(data));
  },

  // Login Item (FR-005)
  getLoginItemSettings: () => ipcRenderer.invoke('app:get-login-item-settings'),
  setLoginItemSettings: (openAtLogin: boolean) =>
    ipcRenderer.invoke('app:set-login-item-settings', { openAtLogin }),
});
```

---

## 7. Error Handling Strategy

### 7.1 IPC Error Handling

| Error Category | Handling Strategy | User Impact |
| --- | --- | --- |
| Command execution failure | Catch in system-info.js, return default/error object | Show "unavailable" in UI |
| IPC timeout | 5-second timeout in invoke wrapper | Show loading spinner, then error |
| Invalid PID for kill | Validate PID > 0 before process.kill() | Show error toast |
| Permission denied (kill) | Catch EPERM error | Show "permission denied" message |
| Polling already active | Guard with null check on interval | No-op (prevent duplicate) |

### 7.2 Renderer Error Handling

```typescript
// Pattern for all hooks
function useXxx() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!window.electronAPI) {
      // NFR-004: Graceful fallback
      setData(mockData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await window.electronAPI.getXxx();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
```

---
---

## 日本語版 (Japanese)

# 05 - 詳細設計書

| 項目           | 値                                                 |
| -------------- | -------------------------------------------------- |
| 文書ID         | DD-001                                             |
| プロジェクト   | Secure Agent OS / OpenNeo                          |
| バージョン     | 1.0                                                |
| 日付           | 2026-02-22                                         |
| 作成者         | OpenNeo エンジニアリングチーム                      |
| ステータス     | ドラフト                                           |
| 入力元         | 03_要件定義書, 04_基本設計書                        |
| 出力先         | 06_テスト計画書, 07_テスト仕様書                    |

---

### 1. IPCチャネルインターフェース仕様

| # | チャネル | 方向 | パターン | リクエスト | レスポンス | 要件 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `system:get-static-info` | レンダラー→メイン | invoke/handle | (なし) | `StaticSystemInfo` | FR-001 |
| 2 | `system:get-dynamic-info` | レンダラー→メイン | invoke/handle | (なし) | `DynamicSystemInfo` | FR-002, FR-007 |
| 3 | `system:get-processes` | レンダラー→メイン | invoke/handle | (なし) | `ProcessInfo[]` | FR-004 |
| 4 | `system:get-battery` | レンダラー→メイン | invoke/handle | (なし) | `BatteryInfo` | FR-006 |
| 5 | `system:start-polling` | レンダラー→メイン | send/on | (なし) | (なし - metrics-updateイベントをトリガー) | FR-007 |
| 6 | `system:stop-polling` | レンダラー→メイン | send/on | (なし) | (なし) | FR-007 |
| 7 | `system:metrics-update` | メイン→レンダラー | send/on | - | `DynamicSystemInfo` | FR-002, FR-007 |
| 8 | `system:kill-process` | レンダラー→メイン | invoke/handle | `{ pid: number }` | `KillProcessResult` | FR-004 |
| 9 | `app:get-login-item-settings` | レンダラー→メイン | invoke/handle | (なし) | `LoginItemSettings` | FR-005 |
| 10 | `app:set-login-item-settings` | レンダラー→メイン | invoke/handle | `{ openAtLogin: boolean }` | `LoginItemSettings` | FR-005 |

---

### 2. TypeScript 型定義

#### 2.1 StaticSystemInfo

```typescript
export interface StaticSystemInfo {
  cpuModel: string;          // CPU モデル文字列
  chipGeneration: string;    // チップ世代
  gpuCores: number;          // GPU コア数
  totalRAMBytes: number;     // 総物理RAM（バイト）
  diskTotalBytes: number;    // ディスク総容量（バイト）
  diskFreeBytes: number;     // ディスク空き容量（バイト）
  osVersion: string;         // macOS バージョン文字列
  architecture: string;      // CPU アーキテクチャ
}
```

#### 2.2 DynamicSystemInfo

```typescript
export interface DynamicSystemInfo {
  freeRAMBytes: number;                          // 現在の空きRAM（バイト）
  memoryPressure: 'normal' | 'warn' | 'critical'; // メモリプレッシャーレベル
  cpuLoadPercent: number;                         // 現在のCPU負荷（0-100%）
  diskFreeBytes: number;                          // 現在のディスク空き（バイト）
  timestamp: string;                              // 測定タイムスタンプ（ISO 8601）
}
```

#### 2.3 ProcessInfo

```typescript
export interface ProcessInfo {
  pid: number;       // プロセスID
  ppid: number;      // 親プロセスID
  cpuPercent: number; // CPU使用率
  ramBytes: number;   // メモリ使用量（バイト）
  command: string;    // コマンド名
}
```

#### 2.4 BatteryInfo

```typescript
export interface BatteryInfo {
  percent: number;       // バッテリー残量（0-100）
  charging: boolean;     // 充電中かどうか
  timeRemaining: number; // 推定残り時間（分）。-1=計算中、-2=電源接続中
}
```

#### 2.5 その他の型

```typescript
export interface LoginItemSettings {
  openAtLogin: boolean;  // ログイン時起動設定
}

export interface KillProcessResult {
  success: boolean;      // 終了シグナル送信成功
  error?: string;        // 失敗時エラーメッセージ
}
```

#### 2.6 ElectronAPI インターフェース

```typescript
export interface ElectronAPI {
  platform: string;
  getStaticInfo: () => Promise<StaticSystemInfo>;
  getDynamicInfo: () => Promise<DynamicSystemInfo>;
  getProcesses: () => Promise<ProcessInfo[]>;
  getBattery: () => Promise<BatteryInfo>;
  killProcess: (pid: number) => Promise<KillProcessResult>;
  startPolling: () => void;
  stopPolling: () => void;
  onMetricsUpdate: (callback: (data: DynamicSystemInfo) => void) => void;
  getLoginItemSettings: () => Promise<LoginItemSettings>;
  setLoginItemSettings: (openAtLogin: boolean) => Promise<LoginItemSettings>;
}
```

---

### 3. LLM互換性アルゴリズム

#### 3.1 アルゴリズム仕様

```
入力:
  model.requiredRAMBytes    -- 指定コンテキスト長でのモデル必要RAM
  staticInfo.totalRAMBytes  -- 物理RAM合計
  dynamicInfo.freeRAMBytes  -- 現在の空きRAM
  parallelAgents            -- 同時実行エージェント数（デフォルト: 1）
  contextLength             -- 選択されたコンテキスト長（トークン数）

計算:
  effectiveRAM = freeRAMBytes - (parallelAgents - 1) * requiredRAMBytes * 0.3
  headroomBytes = effectiveRAM - requiredRAMBytes

分類:
  ok:    headroomBytes >= 2GB (2,147,483,648 バイト)
  heavy: 0 <= headroomBytes < 2GB
  ng:    headroomBytes < 0
```

#### 3.2 アルゴリズムウォークスルー例

**シナリオ:** Phi-3 Mini (3.8B Q4) on 36GB M3 Pro Mac
- requiredRAM = 2.5GB, freeRAM = ~27.9GB, 1エージェント
- effectiveRAM = 27.9GB, headroom = 25.4GB => **"ok"**

**シナリオ:** Llama 405B (Q4) on 36GB M3 Pro Mac
- requiredRAM = ~220GB, freeRAM = ~27.9GB, 1エージェント
- headroom = -192.1GB => **"ng"**

---

### 4. React Hook シグネチャ

| Hook | 戻り値 | 説明 |
| --- | --- | --- |
| `useStaticSystemInfo()` | `{ data, loading, error, refetch }` | 静的システム情報の取得（マウント時に1回、手動再取得可能） |
| `useDynamicSystemInfo(interval?)` | `{ data, loading, error }` | 動的メトリクスのポーリング購読（マウント時開始、アンマウント時停止） |
| `useProcesses(interval?)` | `{ processes, loading, error, killProcess }` | プロセス一覧管理と終了操作 |
| `useBattery(interval?)` | `{ data, loading, error }` | バッテリー状態の監視 |
| `useLoginItem()` | `{ settings, loading, toggle }` | ログイン時起動設定の管理 |

全フックは `window.electronAPI` が未定義の場合にモックデータでフォールバック（NFR-004 準拠）。

---

### 5. UIワイヤーフレーム

#### 5.1 システムダッシュボードページ

```
+============================================================================+
|  [<] [O] [>]    OpenNeo                                  [テーマ] [ユーザー]|
+============================================================================+
|            |                                                               |
|  サイドバー |  システム概要                                                 |
|  ---------  |                                                              |
|            |  +----------------------------+  +-------------------------+ |
|  > システム |  | ハードウェア情報            |  | メモリプレッシャー       | |
|    モデル   |  | CPU: Apple M3 Pro          |  |  [=========>    ]  72%  | |
|    エージェント| | GPU: 18コア               |  |  状態: Normal           | |
|    ポリシー  |  | RAM: 36 GB               |  |  空き: 10.1 GB          | |
|    監査     |  | ディスク: 512GB (312GB空き) |  | CPU負荷: 23%            | |
|            |  | OS: macOS 15.3             |  +-------------------------+ |
|            |  +----------------------------+                               |
|            |                                                               |
|            |  実行中プロセス                                                |
|            |  +----------------------------------------------------------+|
|            |  | PID | PPID | CPU% | RAM     | コマンド   | アクション    ||
|            |  |-----|------|------|---------|-----------|-------------- ||
|            |  | ... | ...  | ...  | ...     | ...       | [終了]        ||
|            |  +----------------------------------------------------------+|
+============================================================================+
```

---

### 6. エラー処理戦略

| エラーカテゴリ | 処理戦略 | ユーザーへの影響 |
| --- | --- | --- |
| コマンド実行失敗 | system-info.js でキャッチ、デフォルト/エラーオブジェクトを返す | UIに「利用不可」を表示 |
| IPCタイムアウト | invoke ラッパーで5秒タイムアウト | ローディングスピナー表示後エラー |
| 不正なPID（kill） | PID > 0 をprocess.kill()前に検証 | エラートースト表示 |
| 権限拒否（kill） | EPERM エラーをキャッチ | 「権限拒否」メッセージ表示 |
| ポーリング重複 | interval の null チェックでガード | ノーオペレーション（重複防止） |
