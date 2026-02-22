# 06 - Test Plan

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Document ID    | TP-001                                                       |
| Project        | Secure Agent OS / OpenNeo                                    |
| Version        | 1.0                                                          |
| Date           | 2026-02-22                                                   |
| Author         | OpenNeo Engineering Team                                     |
| Status         | Draft                                                        |
| Traces From    | 03_Requirements_Specification, 04_High_Level_Design, 05_Detailed_Design |
| Traces To      | 07_Test_Specification                                        |

---

## 1. Test Strategy

### 1.1 Overall Approach

The testing strategy follows a layered approach, progressing from isolated pure-logic tests to integrated system tests:

```
Layer 1: Unit Tests (Pure Logic)
    |
    v
Layer 2: Hook Tests (React Hooks with Mocked electronAPI)
    |
    v
Layer 3: Integration Tests (Electron IPC Round-Trip) [Future]
```

### 1.2 Test Principles

| Principle | Description |
| --- | --- |
| **Isolation** | Each test is independent; no shared mutable state between tests |
| **Determinism** | Tests produce the same result on every run; no reliance on real system state |
| **Mock-First** | All Electron APIs are mocked in the renderer test environment |
| **Traceability** | Every test case traces to at least one requirement ID (FR-xxx or NFR-xxx) |
| **Fast Feedback** | Unit and hook tests run in < 30 seconds total |

### 1.3 Layer Details

#### Layer 1: Unit Tests (Pure Logic)

**Scope:** Functions with no side effects and no DOM/API dependencies.

| Target Module | Description | Key Functions |
| --- | --- | --- |
| `llm-compatibility.ts` | LLM compatibility assessment algorithm | `assessCompatibility()` |
| `model-catalog.ts` | Model catalog data structure and validation | Catalog data, validation helpers |

**Rationale:** These are pure computational functions that accept inputs and return outputs. They can be tested with simple assertions without any mocking infrastructure.

#### Layer 2: Hook Tests (React Hooks with Mocked electronAPI)

**Scope:** React hooks that interact with `window.electronAPI`.

| Target Hook | Description | Mock Required |
| --- | --- | --- |
| `useStaticSystemInfo` | Static system info fetching | `electronAPI.getStaticInfo` |
| `useDynamicSystemInfo` | Dynamic metrics polling subscription | `electronAPI.startPolling`, `electronAPI.onMetricsUpdate`, `electronAPI.stopPolling` |
| `useProcesses` | Process list and kill | `electronAPI.getProcesses`, `electronAPI.killProcess` |
| `useBattery` | Battery status | `electronAPI.getBattery` |
| `useLoginItem` | Login item settings | `electronAPI.getLoginItemSettings`, `electronAPI.setLoginItemSettings` |

**Rationale:** These hooks bridge the gap between the Electron IPC layer and React components. Testing with mocked `electronAPI` verifies correct data flow, state management, loading states, and error handling without requiring the Electron runtime.

#### Layer 3: Integration Tests (Future)

**Scope:** Full Electron IPC round-trip tests verifying that main process handlers correctly execute macOS commands, parse results, and return data through the IPC bridge.

**Status:** Planned for Phase 2. Requires Electron test runner (e.g., Playwright with Electron support or Spectron successor).

---

## 2. Test Environment

### 2.1 Test Framework and Tools

| Tool | Purpose | Version |
| --- | --- | --- |
| **Vitest** | Test runner and assertion library | Latest stable |
| **jsdom** | Browser environment simulation for React | Built into Vitest |
| **React Testing Library** | React component and hook testing utilities | Latest stable |
| **@testing-library/jest-dom** | Extended DOM assertions (toBeInTheDocument, etc.) | Latest stable |

### 2.2 Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'lib/llm-compatibility.ts',
        'lib/model-catalog.ts',
        'hooks/**/*.ts',
      ],
      thresholds: {
        'lib/llm-compatibility.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'lib/model-catalog.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

### 2.3 Test Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';

/**
 * Default mock for window.electronAPI.
 * Simulates a 36GB M3 Pro Mac for consistent test results.
 */
const mockElectronAPI = {
  platform: 'darwin',

  getStaticInfo: async () => ({
    cpuModel: 'Apple M3 Pro',
    chipGeneration: 'M3 Pro',
    gpuCores: 18,
    totalRAMBytes: 38_654_705_664, // 36 GB
    diskTotalBytes: 994_662_584_320,
    diskFreeBytes: 524_288_000_000,
    osVersion: '15.3',
    architecture: 'arm64',
  }),

  getDynamicInfo: async () => ({
    freeRAMBytes: 30_000_000_000, // ~27.9 GB free
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
    timeRemaining: 222, // 3h 42m
  }),

  killProcess: async (pid: number) => ({ success: true }),

  startPolling: () => {},
  stopPolling: () => {},
  onMetricsUpdate: (callback: Function) => {},

  getLoginItemSettings: async () => ({ openAtLogin: false }),
  setLoginItemSettings: async (openAtLogin: boolean) => ({ openAtLogin }),
};

// Attach to window by default (individual tests can override)
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
});
```

---

## 3. Coverage Targets

### 3.1 Coverage Requirements

| Module | Statement | Branch | Function | Line | Priority |
| --- | --- | --- | --- | --- | --- |
| `lib/llm-compatibility.ts` | >= 80% | >= 80% | >= 80% | >= 80% | Must |
| `lib/model-catalog.ts` | >= 80% | >= 80% | >= 80% | >= 80% | Must |
| `hooks/useStaticSystemInfo` | >= 70% | >= 70% | >= 70% | >= 70% | Should |
| `hooks/useDynamicSystemInfo` | >= 70% | >= 70% | >= 70% | >= 70% | Should |
| `hooks/useProcesses` | >= 70% | >= 70% | >= 70% | >= 70% | Should |
| `hooks/useBattery` | >= 70% | >= 70% | >= 70% | >= 70% | Could |
| `hooks/useLoginItem` | >= 70% | >= 70% | >= 70% | >= 70% | Could |

### 3.2 Coverage Rationale

- **80%+ for pure logic modules**: These modules contain the core LLM compatibility algorithm and model catalog. High coverage ensures correctness of calculations that directly impact user decisions.
- **70%+ for hooks**: Hooks have more complex lifecycle behavior (mount/unmount, async state updates). Some edge cases (e.g., race conditions) are better covered by integration tests.

---

## 4. Test Schedule

### 4.1 Execution Order

| Phase | Test Category | Prerequisites | Estimated Duration |
| --- | --- | --- | --- |
| Phase 1 | **Unit Tests** | `llm-compatibility.ts` and `model-catalog.ts` implemented | 1 day |
| Phase 2 | **Hook Tests** | React hooks implemented, mock setup verified | 2 days |
| Phase 3 | **Integration Tests** | Electron IPC handlers implemented, test infrastructure set up | 3 days (future) |

### 4.2 CI/CD Integration

```
Git Push / PR
    |
    v
  pnpm test (Vitest)
    |
    +-- Unit tests (Phase 1)
    +-- Hook tests (Phase 2)
    |
    v
  Coverage Report Generation
    |
    v
  Threshold Check (fail if below 80% on critical modules)
    |
    v
  PR Status Check (pass/fail)
```

---

## 5. Test Categories

### 5.1 Unit Tests

#### 5.1.1 LLM Compatibility Engine

| Test Area | Description | Test Cases |
| --- | --- | --- |
| Basic classification | Verify ok/heavy/ng thresholds | TC-001, TC-002 |
| Parallel agents | Verify headroom reduction with multiple agents | TC-003 |
| Context length | Verify RAM increase with longer context | TC-004 |
| RAM configurations | Test across 16GB, 36GB, 64GB, 128GB | TC-005, TC-006 |
| Edge cases | Boundary values at exactly 0 and 2GB headroom | (derived) |

#### 5.1.2 Model Catalog Validation

| Test Area | Description | Test Cases |
| --- | --- | --- |
| Schema validation | All models have required fields | TC-007 |
| Data integrity | requiredRAMBytes > 0 for all models | TC-008 |
| Context options | contextLengthOptions is non-empty for all models | TC-009 |

### 5.2 Hook Tests

#### 5.2.1 useStaticSystemInfo

| Test Area | Description | Test Cases |
| --- | --- | --- |
| Data retrieval | Returns mock static info on mount | TC-010 |
| Loading state | Initially loading, then loaded | TC-010 |
| Error handling | Sets error state on API failure | (derived) |
| Refetch | Calling refetch re-fetches data | (derived) |

#### 5.2.2 useDynamicSystemInfo

| Test Area | Description | Test Cases |
| --- | --- | --- |
| Polling lifecycle | startPolling called on mount, stopPolling on unmount | TC-011 |
| Data updates | onMetricsUpdate callback receives and stores data | TC-011 |
| Loading state | Initially loading until first update | TC-011 |

#### 5.2.3 Fallback Behavior

| Test Area | Description | Test Cases |
| --- | --- | --- |
| API absent | electronAPI undefined does not crash | TC-012 |
| Mock data | Fallback returns usable mock data | TC-012 |

### 5.3 Integration Tests (Future)

| Test Area | Description | Status |
| --- | --- | --- |
| IPC round-trip | Verify data flows from macOS command through IPC to renderer | Planned |
| Polling end-to-end | Verify start/stop/update cycle in Electron runtime | Planned |
| Kill process | Verify SIGTERM delivery and result reporting | Planned |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Mock data diverges from real API shape | Medium | High | TypeScript interfaces shared between mock and implementation |
| Vitest jsdom limitations for hook testing | Low | Medium | Use renderHook from @testing-library/react |
| Flaky async tests | Medium | Medium | Use waitFor/act utilities, avoid arbitrary timeouts |
| macOS-specific commands untestable in CI | High | Medium | Unit tests use mocked data; integration tests run on macOS CI runners |
| Coverage thresholds block deployment | Low | Low | Thresholds are reasonable (80%); team can adjust if justified |

---

## 7. Deliverables

| Deliverable | Description | Location |
| --- | --- | --- |
| Test configuration | Vitest config with coverage settings | `vitest.config.ts` |
| Test setup | Mock electronAPI and global setup | `tests/setup.ts` |
| Unit test files | LLM compatibility and model catalog tests | `tests/unit/` |
| Hook test files | React hook tests | `tests/hooks/` |
| Coverage report | HTML and text coverage reports | `coverage/` (gitignored) |
| Test specification | Detailed test cases | `docs/07_Test_Specification.md` |

---
---

## 日本語版 (Japanese)

# 06 - テスト計画書

| 項目           | 値                                                           |
| -------------- | ------------------------------------------------------------ |
| 文書ID         | TP-001                                                       |
| プロジェクト   | Secure Agent OS / OpenNeo                                    |
| バージョン     | 1.0                                                          |
| 日付           | 2026-02-22                                                   |
| 作成者         | OpenNeo エンジニアリングチーム                                |
| ステータス     | ドラフト                                                     |
| 入力元         | 03_要件定義書, 04_基本設計書, 05_詳細設計書                   |
| 出力先         | 07_テスト仕様書                                               |

---

### 1. テスト戦略

#### 1.1 全体アプローチ

テスト戦略は段階的アプローチに従い、分離された純粋ロジックテストから統合システムテストへ進行します：

```
レイヤー1: ユニットテスト（純粋ロジック）
    |
    v
レイヤー2: フックテスト（モック化されたelectronAPIとReact Hooks）
    |
    v
レイヤー3: 統合テスト（Electron IPC ラウンドトリップ）[将来]
```

#### 1.2 テスト原則

| 原則 | 説明 |
| --- | --- |
| **分離** | 各テストは独立。テスト間で共有される可変状態なし |
| **決定性** | テストは毎回同じ結果を生成。実際のシステム状態に依存しない |
| **モックファースト** | レンダラーテスト環境では全 Electron API をモック化 |
| **トレーサビリティ** | 全テストケースが少なくとも1つの要件ID (FR-xxx / NFR-xxx) にトレース |
| **高速フィードバック** | ユニットテストとフックテストは合計30秒未満で実行 |

#### 1.3 レイヤー詳細

**レイヤー1: ユニットテスト（純粋ロジック）**

| 対象モジュール | 説明 | 主要関数 |
| --- | --- | --- |
| `llm-compatibility.ts` | LLM互換性評価アルゴリズム | `assessCompatibility()` |
| `model-catalog.ts` | モデルカタログデータ構造と検証 | カタログデータ、検証ヘルパー |

**レイヤー2: フックテスト（React Hooks + モック electronAPI）**

| 対象フック | 説明 | モック対象 |
| --- | --- | --- |
| `useStaticSystemInfo` | 静的システム情報取得 | `electronAPI.getStaticInfo` |
| `useDynamicSystemInfo` | 動的メトリクスポーリング購読 | `electronAPI.startPolling`, `onMetricsUpdate`, `stopPolling` |
| `useProcesses` | プロセス一覧と終了 | `electronAPI.getProcesses`, `killProcess` |
| `useBattery` | バッテリー状態 | `electronAPI.getBattery` |
| `useLoginItem` | ログインアイテム設定 | `electronAPI.getLoginItemSettings`, `setLoginItemSettings` |

**レイヤー3: 統合テスト（将来）**

Electron IPC ラウンドトリップテスト。Phase 2 で計画。

---

### 2. テスト環境

#### 2.1 テストフレームワークとツール

| ツール | 目的 | バージョン |
| --- | --- | --- |
| **Vitest** | テストランナーとアサーションライブラリ | 最新安定版 |
| **jsdom** | React 用ブラウザ環境シミュレーション | Vitest 組み込み |
| **React Testing Library** | React コンポーネント・フックテストユーティリティ | 最新安定版 |
| **@testing-library/jest-dom** | 拡張DOMアサーション | 最新安定版 |

#### 2.2 テストセットアップファイル

`tests/setup.ts` で `window.electronAPI` のデフォルトモックを提供：
- 36GB M3 Pro Mac を一貫したテスト環境としてシミュレート
- 個別テストでのオーバーライド可能（`writable: true, configurable: true`）

---

### 3. カバレッジ目標

| モジュール | ステートメント | ブランチ | 関数 | 行 | 優先度 |
| --- | --- | --- | --- | --- | --- |
| `lib/llm-compatibility.ts` | >= 80% | >= 80% | >= 80% | >= 80% | Must |
| `lib/model-catalog.ts` | >= 80% | >= 80% | >= 80% | >= 80% | Must |
| `hooks/*` | >= 70% | >= 70% | >= 70% | >= 70% | Should |

---

### 4. テストスケジュール

| フェーズ | テストカテゴリ | 前提条件 | 推定期間 |
| --- | --- | --- | --- |
| Phase 1 | **ユニットテスト** | `llm-compatibility.ts` と `model-catalog.ts` の実装完了 | 1日 |
| Phase 2 | **フックテスト** | React フック実装完了、モックセットアップ検証済み | 2日 |
| Phase 3 | **統合テスト** | Electron IPC ハンドラ実装完了、テストインフラ構築 | 3日（将来） |

---

### 5. テストカテゴリ

#### 5.1 ユニットテスト

**LLM互換性エンジン:**

| テスト領域 | 説明 | テストケース |
| --- | --- | --- |
| 基本分類 | ok/heavy/ng 閾値の検証 | TC-001, TC-002 |
| 並列エージェント | 複数エージェントによるヘッドルーム減少の検証 | TC-003 |
| コンテキスト長 | 長いコンテキストによるRAM増加の検証 | TC-004 |
| RAM構成 | 16GB, 36GB, 64GB, 128GB でのテスト | TC-005, TC-006 |

**モデルカタログ検証:**

| テスト領域 | 説明 | テストケース |
| --- | --- | --- |
| スキーマ検証 | 全モデルが必須フィールドを持つ | TC-007 |
| データ整合性 | 全モデルで requiredRAMBytes > 0 | TC-008 |
| コンテキストオプション | 全モデルで contextLengthOptions が非空 | TC-009 |

#### 5.2 フックテスト

| テスト領域 | 説明 | テストケース |
| --- | --- | --- |
| データ取得 | マウント時にモック静的情報を返す | TC-010 |
| ポーリングライフサイクル | マウント時にstartPolling、アンマウント時にstopPolling呼出 | TC-011 |
| API不在フォールバック | electronAPI未定義でクラッシュしない | TC-012 |

---

### 6. リスク評価

| リスク | 可能性 | 影響 | 軽減策 |
| --- | --- | --- | --- |
| モックデータが実際のAPI形状と乖離 | 中 | 高 | TypeScriptインターフェースをモックと実装で共有 |
| Vitest jsdom のフックテスト制限 | 低 | 中 | @testing-library/react の renderHook を使用 |
| 非同期テストの不安定性 | 中 | 中 | waitFor/act ユーティリティを使用、任意のタイムアウトを回避 |
| macOS固有コマンドがCIでテスト不可 | 高 | 中 | ユニットテストはモックデータ使用、統合テストはmacOS CIランナーで実行 |

---

### 7. 成果物

| 成果物 | 説明 | 場所 |
| --- | --- | --- |
| テスト設定 | カバレッジ設定付きVitest設定 | `vitest.config.ts` |
| テストセットアップ | モック electronAPI とグローバルセットアップ | `tests/setup.ts` |
| ユニットテストファイル | LLM互換性とモデルカタログテスト | `tests/unit/` |
| フックテストファイル | React フックテスト | `tests/hooks/` |
| カバレッジレポート | HTMLとテキストのカバレッジレポート | `coverage/` (gitignored) |
| テスト仕様書 | 詳細テストケース | `docs/07_Test_Specification.md` |
