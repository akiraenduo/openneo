# 03 - Requirements Specification

| Field          | Value                                                |
| -------------- | ---------------------------------------------------- |
| Document ID    | RS-001                                               |
| Project        | Secure Agent OS / OpenNeo                            |
| Version        | 1.0                                                  |
| Date           | 2026-02-22                                           |
| Author         | OpenNeo Engineering Team                             |
| Status         | Draft                                                |
| Traces From    | source_gpt.md (Sections 4-7), 02_Requirements_Definition |
| Traces To      | 04_High_Level_Design, 05_Detailed_Design, 06_Test_Plan, 07_Test_Specification |

---

## 1. Functional Requirements

### FR-001: System Information Retrieval

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-001 |
| Priority        | Must |
| Source          | source_gpt.md Section 4 (Target Architecture), US-SM-001 |
| Description     | The system shall retrieve and display static hardware and OS information from the host Mac. |

**Details:**

The application shall retrieve the following information via Electron IPC:

| Data Field | Type | Source Command (macOS) | Example Value |
| --- | --- | --- | --- |
| CPU Model | string | `sysctl -n machdep.cpu.brand_string` | "Apple M3 Pro" |
| Chip Generation | string | Parsed from CPU model | "M3 Pro" |
| GPU Cores | number | `system_profiler SPDisplaysDataType` | 18 |
| Total RAM (bytes) | number | `sysctl -n hw.memsize` | 38654705664 (36GB) |
| Disk Total (bytes) | number | `df -k /` | 994662584320 |
| Disk Free (bytes) | number | `df -k /` | 524288000000 |
| OS Version | string | `sw_vers -productVersion` | "15.3" |
| Architecture | string | `uname -m` | "arm64" |

**Acceptance Criteria:**
- All fields populated within 2 seconds of request
- Values match actual hardware specifications
- Returns structured object (not raw command output)

---

### FR-002: Memory Visualization

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-002 |
| Priority        | Must |
| Source          | source_gpt.md Section 4, US-SM-002 |
| Description     | The system shall display real-time memory pressure with visual indicators. |

**Details:**

Memory pressure shall be categorized into three levels:

| Level | Condition | Visual Indicator |
| --- | --- | --- |
| Normal | Free RAM > 4GB and < 75% used | Green |
| Warn | Free RAM 1-4GB or 75-90% used | Yellow |
| Critical | Free RAM < 1GB or > 90% used | Red |

**Data Source:** `vm_stat` or `/usr/bin/memory_pressure` on macOS.

**Acceptance Criteria:**
- Memory pressure updates every 3 seconds (linked to FR-007 polling)
- Visual gauge displays current free RAM in human-readable format (e.g., "12.3 GB free")
- Color coding matches pressure level thresholds

---

### FR-003: LLM Compatibility Detection

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-003 |
| Priority        | Must |
| Source          | source_gpt.md Section 5, US-LLM-001, US-LLM-002, US-LLM-003 |
| Description     | The system shall assess LLM compatibility based on hardware RAM, model requirements, parallel agent count, and context length. |

**Algorithm:**

```
Input:
  model.requiredRAMBytes    -- RAM required by the model at given context length
  staticInfo.totalRAMBytes  -- Total physical RAM
  dynamicInfo.freeRAMBytes  -- Currently free RAM
  parallelAgents            -- Number of concurrent agents (default: 1)
  contextLength             -- Selected context length

effectiveRAM = freeRAMBytes - (parallelAgents - 1) * model.requiredRAMBytes * 0.3
headroomBytes = effectiveRAM - model.requiredRAMBytes

Classification:
  ok:    headroomBytes >= 2GB (2,147,483,648 bytes)
  heavy: headroomBytes >= 0 AND headroomBytes < 2GB
  ng:    headroomBytes < 0
```

**Acceptance Criteria:**
- Phi-3 Mini (3.8B Q4, ~2.5GB) on 36GB Mac => "ok"
- Llama 405B (Q4, ~220GB) on 36GB Mac => "ng"
- Increasing parallel agents reduces headroom proportionally
- Increasing context length increases requiredRAMBytes, potentially changing status
- Results displayed per-model in a sortable table

---

### FR-004: Process Management

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-004 |
| Priority        | Must |
| Source          | source_gpt.md Section 5, US-SM-003 |
| Description     | The system shall list running processes and allow the user to terminate selected processes. |

**Details:**

Process listing shall include:

| Field | Type | Description |
| --- | --- | --- |
| pid | number | Process ID |
| ppid | number | Parent process ID |
| cpuPercent | number | CPU usage percentage |
| ramBytes | number | Resident memory in bytes |
| command | string | Process command name |

**Data Source:** `ps aux` or equivalent macOS system call.

**Kill Operation:**
- Sends `SIGTERM` to specified PID
- Returns success/failure with optional error message
- Requires user confirmation before execution

**Acceptance Criteria:**
- Process list sortable by PID, CPU%, RAM, command name
- Kill operation returns result within 1 second
- Killed process disappears from list on next refresh
- Attempting to kill a protected system process returns an error (not a crash)

---

### FR-005: Login Item Management

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-005 |
| Priority        | Should |
| Source          | source_gpt.md Section 5.2 (Heartbeat), US-SM-005 |
| Description     | The system shall allow the user to get and set the "Open at Login" preference. |

**Details:**

Uses Electron's `app.getLoginItemSettings()` and `app.setLoginItemSettings()` API.

**Acceptance Criteria:**
- Current login item state is displayed as a toggle switch
- Toggling the switch immediately updates the system setting
- Setting persists across application restarts
- State accurately reflects macOS System Settings > Login Items

---

### FR-006: Battery Status Monitoring

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-006 |
| Priority        | Should |
| Source          | source_gpt.md Section 4, US-SM-004 |
| Description     | The system shall display current battery status including charge level, charging state, and estimated time remaining. |

**Details:**

| Field | Type | Description |
| --- | --- | --- |
| percent | number | Battery charge percentage (0-100) |
| charging | boolean | Whether the device is currently charging |
| timeRemaining | number | Estimated minutes remaining (-1 if calculating, -2 if plugged in) |

**Data Source:** `pmset -g batt` on macOS.

**Acceptance Criteria:**
- Battery percentage displayed with visual bar
- Charging indicator shown (lightning icon or text)
- "Calculating..." shown when timeRemaining is -1
- Updates with dynamic metrics polling (FR-007)
- Desktop Macs with no battery show "N/A" or equivalent graceful state

---

### FR-007: Dynamic System Metrics Polling

| Attribute       | Value |
| --------------- | ----- |
| ID              | FR-007 |
| Priority        | Must |
| Source          | source_gpt.md Section 4, US-SM-006 |
| Description     | The system shall poll dynamic system metrics at a configurable interval (default 3 seconds) and push updates to the renderer. |

**Details:**

Polling mechanism:
1. Renderer sends `system:start-polling` to main process
2. Main process begins collecting metrics every 3 seconds
3. Main process sends `system:metrics-update` event to renderer with fresh data
4. Renderer sends `system:stop-polling` when navigating away or unmounting

**Polled Metrics:** DynamicSystemInfo (free RAM, memory pressure, CPU load, disk free, timestamp)

**Acceptance Criteria:**
- Polling interval is 3 seconds (configurable)
- Polling stops cleanly when renderer requests stop or window closes
- No memory leaks from accumulated polling data
- Metrics include a timestamp for each update
- Multiple simultaneous polling requests do not create duplicate intervals

---

## 2. Non-Functional Requirements

### NFR-001: Security

| Attribute       | Value |
| --------------- | ----- |
| ID              | NFR-001 |
| Priority        | Must |
| Source          | source_gpt.md Sections 4.1, 6.2 |
| Description     | The system shall enforce Electron security best practices. |

**Details:**

| Security Control | Implementation |
| --- | --- |
| Context Isolation | `contextIsolation: true` in BrowserWindow webPreferences |
| No Node Integration | `nodeIntegration: false` in BrowserWindow webPreferences |
| Preload Script | All IPC exposed via `contextBridge.exposeInMainWorld()` |
| IPC Validation | Main process validates all IPC message parameters |
| No Remote Module | `enableRemoteModule` not used |
| CSP | Content Security Policy headers configured |

**Acceptance Criteria:**
- `contextIsolation` is `true` in all BrowserWindow configurations
- `nodeIntegration` is `false` in all BrowserWindow configurations
- No direct `require()` calls in renderer code
- All renderer-to-main communication goes through defined IPC channels

---

### NFR-002: Performance

| Attribute       | Value |
| --------------- | ----- |
| ID              | NFR-002 |
| Priority        | Must |
| Source          | source_gpt.md Section 6 |
| Description     | The system shall meet defined performance targets for responsiveness and resource usage. |

**Performance Targets:**

| Metric | Target | Measurement |
| --- | --- | --- |
| Polling Interval | 3 seconds | Timer accuracy within +/- 100ms |
| IPC Latency | < 100ms | Round-trip time for any IPC call |
| Static Info Load | < 2 seconds | Time from request to data display |
| UI Frame Rate | >= 30 FPS | During metric updates and animations |
| Memory Footprint | < 200MB | Application RSS during normal operation |
| CPU Idle Usage | < 3% | When polling is active but no user interaction |

**Acceptance Criteria:**
- IPC round-trip for `system:get-static-info` completes in < 100ms
- Dynamic polling does not cause UI jank or dropped frames
- Application memory usage does not grow unbounded over time

---

### NFR-003: Target Operating System

| Attribute       | Value |
| --------------- | ----- |
| ID              | NFR-003 |
| Priority        | Must |
| Source          | source_gpt.md Section 2.1 |
| Description     | The system shall target macOS on Apple Silicon (arm64) architecture. |

**Details:**

| Specification | Value |
| --- | --- |
| Target Architecture | arm64 (Apple Silicon) |
| Minimum macOS Version | 13.0 (Ventura) |
| Supported Chips | M1, M1 Pro/Max/Ultra, M2, M2 Pro/Max/Ultra, M3, M3 Pro/Max/Ultra, M4, M4 Pro/Max/Ultra |
| Distribution Format | DMG (current), Mac App Store (target) |
| Code Signing | Apple Developer ID + Notarization |

**Acceptance Criteria:**
- Application launches and operates correctly on arm64 macOS
- Electron builder configured with `--mac --arm64` target
- No x86-only dependencies in the dependency tree

---

### NFR-004: Graceful Fallback (Browser Dev Mode)

| Attribute       | Value |
| --------------- | ----- |
| ID              | NFR-004 |
| Priority        | Must |
| Source          | Development workflow requirement |
| Description     | When `window.electronAPI` is unavailable (e.g., running in a browser via `next dev`), the system shall degrade gracefully with mock data or informative messages. |

**Details:**

Fallback behavior per feature:

| Feature | Fallback Behavior |
| --- | --- |
| Static System Info | Display mock/placeholder data with "Dev Mode" indicator |
| Dynamic Metrics | Display static mock values, no polling |
| Process Management | Display mock process list, kill operation disabled |
| Battery Status | Display "N/A - Browser Mode" |
| Login Item Settings | Toggle disabled with explanatory tooltip |
| LLM Compatibility | Use mock hardware values (e.g., 36GB RAM) for calculations |

**Acceptance Criteria:**
- No runtime errors or crashes when `window.electronAPI` is `undefined`
- UI renders completely with fallback data
- Developer can identify they are in fallback mode (visual indicator)
- All React hooks handle the missing API without throwing

---

## 3. Requirements Traceability to Source

| Requirement ID | source_gpt.md Section | User Story IDs |
| --- | --- | --- |
| FR-001 | 4.2 (Target Architecture Components) | US-SM-001 |
| FR-002 | 4.2, 5.2 | US-SM-002 |
| FR-003 | 5 (Functional Requirements), 4.2 (Model Gateway) | US-LLM-001, US-LLM-002, US-LLM-003 |
| FR-004 | 5.2 (Automation / Heartbeat - process control) | US-SM-003 |
| FR-005 | 5.2 (Heartbeat - persistent operation) | US-SM-005 |
| FR-006 | 4 (Target Architecture) | US-SM-004 |
| FR-007 | 4, 5.2 | US-SM-006 |
| NFR-001 | 4.1 (Security Principles), 6.2 | - |
| NFR-002 | 6 (Non-Functional Requirements) | - |
| NFR-003 | 2.1 (In Scope - Mac desktop) | - |
| NFR-004 | Development workflow | - |

---

## 4. Requirements Summary Matrix

| ID | Name | Type | Priority | Testable | Test Case(s) |
| --- | --- | --- | --- | --- | --- |
| FR-001 | System Info Retrieval | Functional | Must | Yes | TC-010 |
| FR-002 | Memory Visualization | Functional | Must | Yes | TC-011 |
| FR-003 | LLM Compatibility Detection | Functional | Must | Yes | TC-001 ~ TC-006 |
| FR-004 | Process Management | Functional | Must | Yes | (future) |
| FR-005 | Login Item Management | Functional | Should | Yes | (future) |
| FR-006 | Battery Status Monitoring | Functional | Should | Yes | (future) |
| FR-007 | Dynamic Metrics Polling | Functional | Must | Yes | TC-011 |
| NFR-001 | Security (Context Isolation) | Non-Functional | Must | Yes | Code review |
| NFR-002 | Performance | Non-Functional | Must | Yes | Benchmark |
| NFR-003 | Target OS (macOS arm64) | Non-Functional | Must | Yes | Build verification |
| NFR-004 | Graceful Fallback | Non-Functional | Must | Yes | TC-012 |

---
---

## 日本語版 (Japanese)

# 03 - 要件定義書

| 項目           | 値                                                   |
| -------------- | ---------------------------------------------------- |
| 文書ID         | RS-001                                               |
| プロジェクト   | Secure Agent OS / OpenNeo                            |
| バージョン     | 1.0                                                  |
| 日付           | 2026-02-22                                           |
| 作成者         | OpenNeo エンジニアリングチーム                        |
| ステータス     | ドラフト                                             |
| 入力元         | source_gpt.md (セクション 4-7), 02_要求定義書        |
| 出力先         | 04_基本設計書, 05_詳細設計書, 06_テスト計画書, 07_テスト仕様書 |

---

### 1. 機能要件

#### FR-001: システム情報取得

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-001 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 4（目標アーキテクチャ）, US-SM-001 |
| 説明       | システムはホスト Mac から静的ハードウェアおよび OS 情報を取得・表示する。 |

取得データ:

| データフィールド | 型 | ソースコマンド (macOS) | 値の例 |
| --- | --- | --- | --- |
| CPU モデル | string | `sysctl -n machdep.cpu.brand_string` | "Apple M3 Pro" |
| チップ世代 | string | CPU モデルからパース | "M3 Pro" |
| GPU コア数 | number | `system_profiler SPDisplaysDataType` | 18 |
| 総RAM (バイト) | number | `sysctl -n hw.memsize` | 38654705664 (36GB) |
| ディスク合計 (バイト) | number | `df -k /` | 994662584320 |
| ディスク空き (バイト) | number | `df -k /` | 524288000000 |
| OS バージョン | string | `sw_vers -productVersion` | "15.3" |
| アーキテクチャ | string | `uname -m` | "arm64" |

**受入基準:**
- リクエストから2秒以内に全フィールドが入力される
- 値が実際のハードウェア仕様と一致する
- 構造化オブジェクトを返す（生のコマンド出力ではない）

---

#### FR-002: メモリ可視化

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-002 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 4, US-SM-002 |
| 説明       | システムはリアルタイムのメモリプレッシャーを視覚的インジケーターで表示する。 |

メモリプレッシャーの3段階分類:

| レベル | 条件 | 視覚インジケーター |
| --- | --- | --- |
| Normal | 空きRAM > 4GB かつ使用率 < 75% | 緑 |
| Warn | 空きRAM 1-4GB または使用率 75-90% | 黄 |
| Critical | 空きRAM < 1GB または使用率 > 90% | 赤 |

**受入基準:**
- メモリプレッシャーは3秒ごとに更新（FR-007 ポーリングと連動）
- 視覚ゲージが人間が読みやすい形式で現在の空きRAMを表示
- カラーコーディングがプレッシャーレベル閾値と一致

---

#### FR-003: LLM 互換性検出

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-003 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 5, US-LLM-001, US-LLM-002, US-LLM-003 |
| 説明       | システムはハードウェアRAM、モデル要件、並列エージェント数、コンテキスト長に基づいてLLM互換性を評価する。 |

**アルゴリズム:**

```
入力:
  model.requiredRAMBytes    -- 指定コンテキスト長でのモデル必要RAM
  staticInfo.totalRAMBytes  -- 物理RAM合計
  dynamicInfo.freeRAMBytes  -- 現在の空きRAM
  parallelAgents            -- 同時実行エージェント数（デフォルト: 1）
  contextLength             -- 選択されたコンテキスト長

effectiveRAM = freeRAMBytes - (parallelAgents - 1) * model.requiredRAMBytes * 0.3
headroomBytes = effectiveRAM - model.requiredRAMBytes

分類:
  ok:    headroomBytes >= 2GB (2,147,483,648 バイト)
  heavy: headroomBytes >= 0 かつ headroomBytes < 2GB
  ng:    headroomBytes < 0
```

**受入基準:**
- Phi-3 Mini (3.8B Q4, ~2.5GB) on 36GB Mac => "ok"
- Llama 405B (Q4, ~220GB) on 36GB Mac => "ng"
- 並列エージェント増加でヘッドルームが比例的に減少
- コンテキスト長増加で requiredRAMBytes が増加し、ステータスが変化する可能性

---

#### FR-004: プロセス管理

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-004 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 5, US-SM-003 |
| 説明       | システムは実行中プロセスを一覧表示し、選択したプロセスの終了を許可する。 |

**受入基準:**
- プロセス一覧が PID、CPU%、RAM、コマンド名でソート可能
- 終了操作が1秒以内に結果を返す
- 保護されたシステムプロセスの終了試行はエラーを返す（クラッシュではない）

---

#### FR-005: ログインアイテム管理

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-005 |
| 優先度     | Should |
| ソース     | source_gpt.md セクション 5.2, US-SM-005 |
| 説明       | システムは「ログイン時に開く」設定の取得・設定を許可する。 |

---

#### FR-006: バッテリー状態監視

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-006 |
| 優先度     | Should |
| ソース     | source_gpt.md セクション 4, US-SM-004 |
| 説明       | システムは充電レベル、充電状態、推定残り時間を含む現在のバッテリー状態を表示する。 |

---

#### FR-007: 動的システムメトリクスポーリング

| 属性       | 値 |
| ---------- | -- |
| ID         | FR-007 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 4, US-SM-006 |
| 説明       | システムは設定可能な間隔（デフォルト3秒）で動的システムメトリクスをポーリングし、レンダラーに更新をプッシュする。 |

**受入基準:**
- ポーリング間隔は3秒（設定可能）
- レンダラーの停止要求またはウィンドウクローズ時にポーリングがクリーンに停止
- 蓄積されたポーリングデータによるメモリリークなし
- 各更新にタイムスタンプを含む

---

### 2. 非機能要件

#### NFR-001: セキュリティ

| 属性       | 値 |
| ---------- | -- |
| ID         | NFR-001 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 4.1, 6.2 |
| 説明       | システムは Electron セキュリティのベストプラクティスを強制する。 |

- `contextIsolation: true`（全 BrowserWindow）
- `nodeIntegration: false`（全 BrowserWindow）
- 全 IPC は `contextBridge.exposeInMainWorld()` 経由で公開
- メインプロセスが全 IPC メッセージパラメータを検証

---

#### NFR-002: パフォーマンス

| 属性       | 値 |
| ---------- | -- |
| ID         | NFR-002 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 6 |
| 説明       | システムは応答性とリソース使用の定義されたパフォーマンス目標を満たす。 |

| メトリック | 目標 |
| --- | --- |
| ポーリング間隔 | 3秒 |
| IPC レイテンシ | < 100ms |
| 静的情報読み込み | < 2秒 |
| UI フレームレート | >= 30 FPS |
| メモリフットプリント | < 200MB |
| CPU アイドル使用率 | < 3% |

---

#### NFR-003: 対象OS

| 属性       | 値 |
| ---------- | -- |
| ID         | NFR-003 |
| 優先度     | Must |
| ソース     | source_gpt.md セクション 2.1 |
| 説明       | システムは macOS Apple Silicon (arm64) アーキテクチャをターゲットとする。 |

- 対象アーキテクチャ: arm64 (Apple Silicon)
- 最小 macOS バージョン: 13.0 (Ventura)
- 配布形式: DMG（現行）、Mac App Store（目標）

---

#### NFR-004: グレースフルフォールバック（ブラウザ開発モード）

| 属性       | 値 |
| ---------- | -- |
| ID         | NFR-004 |
| 優先度     | Must |
| ソース     | 開発ワークフロー要件 |
| 説明       | `window.electronAPI` が利用不可の場合（例：`next dev` でブラウザ実行時）、システムはモックデータまたは情報メッセージで適切に劣化動作する。 |

**受入基準:**
- `window.electronAPI` が `undefined` の場合にランタイムエラーやクラッシュなし
- UI がフォールバックデータで完全にレンダリングされる
- 開発者がフォールバックモードであることを識別可能（視覚インジケーター）
- 全 React フックが API 不在をスローなしで処理

---

### 3. 要件トレーサビリティ（ソースへのマッピング）

| 要件ID | source_gpt.md セクション | ユーザーストーリーID |
| --- | --- | --- |
| FR-001 | 4.2 | US-SM-001 |
| FR-002 | 4.2, 5.2 | US-SM-002 |
| FR-003 | 5, 4.2 | US-LLM-001, US-LLM-002, US-LLM-003 |
| FR-004 | 5.2 | US-SM-003 |
| FR-005 | 5.2 | US-SM-005 |
| FR-006 | 4 | US-SM-004 |
| FR-007 | 4, 5.2 | US-SM-006 |
| NFR-001 | 4.1, 6.2 | - |
| NFR-002 | 6 | - |
| NFR-003 | 2.1 | - |
| NFR-004 | 開発ワークフロー | - |

---

### 4. 要件サマリマトリクス

| ID | 名称 | 種別 | 優先度 | テスト可能 | テストケース |
| --- | --- | --- | --- | --- | --- |
| FR-001 | システム情報取得 | 機能 | Must | Yes | TC-010 |
| FR-002 | メモリ可視化 | 機能 | Must | Yes | TC-011 |
| FR-003 | LLM互換性検出 | 機能 | Must | Yes | TC-001 ~ TC-006 |
| FR-004 | プロセス管理 | 機能 | Must | Yes | (将来) |
| FR-005 | ログインアイテム管理 | 機能 | Should | Yes | (将来) |
| FR-006 | バッテリー状態監視 | 機能 | Should | Yes | (将来) |
| FR-007 | 動的メトリクスポーリング | 機能 | Must | Yes | TC-011 |
| NFR-001 | セキュリティ | 非機能 | Must | Yes | コードレビュー |
| NFR-002 | パフォーマンス | 非機能 | Must | Yes | ベンチマーク |
| NFR-003 | 対象OS | 非機能 | Must | Yes | ビルド検証 |
| NFR-004 | グレースフルフォールバック | 非機能 | Must | Yes | TC-012 |
