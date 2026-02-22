# 04 - High-Level Design

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document ID    | HLD-001                                    |
| Project        | Secure Agent OS / OpenNeo                  |
| Version        | 1.0                                        |
| Date           | 2026-02-22                                 |
| Author         | OpenNeo Engineering Team                   |
| Status         | Draft                                      |
| Traces From    | 03_Requirements_Specification              |
| Traces To      | 05_Detailed_Design, 06_Test_Plan           |

---

## 1. Architecture Overview

### 1.1 Architecture Diagram

```
+===================================================================+
|                        OpenNeo Application                         |
+===================================================================+
|                                                                    |
|  +------------------------------+    +-------------------------+   |
|  |    Electron Main Process     |    |    macOS System APIs    |   |
|  |                              |    |                         |   |
|  |  +------------------------+  |    |  sysctl                 |   |
|  |  |      main.js           |  |    |  system_profiler        |   |
|  |  |                        |  |    |  vm_stat                |   |
|  |  |  - BrowserWindow       |  |    |  ps aux                 |   |
|  |  |  - IPC Handlers        |<-------->  pmset -g batt        |   |
|  |  |  - App Lifecycle       |  |    |  df -k                  |   |
|  |  +------------------------+  |    |  sw_vers                |   |
|  |              |               |    |  uname                  |   |
|  |  +------------------------+  |    +-------------------------+   |
|  |  |  system-info.js        |  |                                  |
|  |  |  (System Info Module)  |  |                                  |
|  |  |                        |  |                                  |
|  |  |  - getStaticInfo()     |  |                                  |
|  |  |  - getDynamicInfo()    |  |                                  |
|  |  |  - getProcesses()      |  |                                  |
|  |  |  - getBattery()        |  |                                  |
|  |  |  - killProcess(pid)    |  |                                  |
|  |  +------------------------+  |                                  |
|  +-------------|----------------+                                  |
|                |                                                   |
|          IPC Bridge                                                |
|       (contextIsolation)                                           |
|                |                                                   |
|  +-------------|----------------+                                  |
|  |    Preload Script           |                                   |
|  |                              |                                  |
|  |  +------------------------+  |                                  |
|  |  |    preload.js          |  |                                  |
|  |  |                        |  |                                  |
|  |  |  contextBridge         |  |                                  |
|  |  |    .exposeInMainWorld  |  |                                  |
|  |  |    ('electronAPI', {   |  |                                  |
|  |  |      getStaticInfo,    |  |                                  |
|  |  |      getDynamicInfo,   |  |                                  |
|  |  |      getProcesses,     |  |                                  |
|  |  |      getBattery,       |  |                                  |
|  |  |      killProcess,      |  |                                  |
|  |  |      startPolling,     |  |                                  |
|  |  |      stopPolling,      |  |                                  |
|  |  |      onMetricsUpdate,  |  |                                  |
|  |  |      getLoginItem,     |  |                                  |
|  |  |      setLoginItem,     |  |                                  |
|  |  |    })                  |  |                                  |
|  |  +------------------------+  |                                  |
|  +-------------|----------------+                                  |
|                |                                                   |
|  +-------------|--------------------------------------------------+
|  |    Renderer Process (Next.js)                                  |
|  |                                                                |
|  |  +------------------+  +--------------------+  +------------+  |
|  |  |  Dashboard Pages |  |  React Hooks       |  | LLM Engine |  |
|  |  |                  |  |                    |  |            |  |
|  |  |  /dashboard      |  |  useStaticSystem   |  | compat     |  |
|  |  |  /dashboard/     |  |    Info()          |  |   check()  |  |
|  |  |    models        |  |  useDynamicSystem  |  | model      |  |
|  |  |  /dashboard/     |  |    Info()          |  |   catalog  |  |
|  |  |    agents        |  |  useProcesses()    |  |            |  |
|  |  |  /dashboard/     |  |  useBattery()      |  |            |  |
|  |  |    policies      |  |  useLoginItem()    |  |            |  |
|  |  |  /dashboard/     |  |                    |  |            |  |
|  |  |    audit         |  |                    |  |            |  |
|  |  +------------------+  +--------------------+  +------------+  |
|  |                                                                |
|  |  +----------------------------------------------------------+  |
|  |  |  UI Component Library (shadcn/ui + Radix + Tailwind)     |  |
|  |  +----------------------------------------------------------+  |
|  +----------------------------------------------------------------+
|                                                                    |
+====================================================================+
```

### 1.2 Layer Description

| Layer | Process | Technology | Responsibility |
| --- | --- | --- | --- |
| **Electron Main** | Main (Node.js) | Node.js, child_process | System API access, IPC handling, window management, app lifecycle |
| **System Info Module** | Main (Node.js) | child_process.execSync | macOS command execution, data parsing, structured output |
| **Preload** | Preload (Isolated) | contextBridge | Secure API surface exposure between main and renderer |
| **Renderer** | Renderer (Chromium) | Next.js 16, React 19 | UI rendering, state management, user interaction |
| **React Hooks** | Renderer | React hooks | Data fetching abstraction, polling lifecycle, error handling |
| **LLM Engine** | Renderer | Pure TypeScript | Compatibility calculation, model catalog management |
| **UI Components** | Renderer | shadcn/ui, Radix, Tailwind | Reusable visual components |

---

## 2. Component Structure

### 2.1 Electron Main Process

```
electron/
  main.js              -- App entry point, BrowserWindow creation, IPC handler registration
  preload.js           -- contextBridge API exposure
  system-info.js       -- System information retrieval module (planned)
```

#### main.js Responsibilities
- Create BrowserWindow with security-hardened webPreferences
- Register IPC handlers for all `system:*` and `app:*` channels
- Manage app lifecycle (ready, activate, window-all-closed)
- Coordinate polling intervals for dynamic metrics

#### system-info.js Responsibilities
- Execute macOS system commands via `child_process.execSync`
- Parse raw command output into structured TypeScript-compatible objects
- Handle command execution errors gracefully
- Provide functions: `getStaticInfo()`, `getDynamicInfo()`, `getProcesses()`, `getBattery()`, `killProcess(pid)`

### 2.2 Preload Script

```
electron/
  preload.js           -- Bridge between main and renderer
```

#### Responsibilities
- Use `contextBridge.exposeInMainWorld('electronAPI', {...})` to expose a safe API surface
- Wrap `ipcRenderer.invoke()` calls for request-response channels
- Wrap `ipcRenderer.send()` for fire-and-forget channels
- Wrap `ipcRenderer.on()` for event subscription channels
- Expose no Node.js primitives (no `require`, no `process`, no `fs`)

### 2.3 Renderer (Next.js Application)

```
app/
  layout.tsx                    -- Root layout
  page.tsx                      -- Landing page
  dashboard/
    layout.tsx                  -- Dashboard layout (sidebar + header)
    page.tsx                    -- Dashboard home / System overview
    models/page.tsx             -- LLM model catalog and compatibility
    agents/page.tsx             -- Agent management
    policies/page.tsx           -- Policy management
    audit/page.tsx              -- Audit log viewer
    credentials/page.tsx        -- Credentials/secrets management
    jobs/page.tsx               -- Job/automation management
    network/page.tsx            -- Network policy management
    requests/page.tsx           -- Request log viewer

components/
  dashboard-header.tsx          -- Dashboard top bar
  dashboard-sidebar.tsx         -- Navigation sidebar
  global-nav.tsx                -- Global navigation
  site-layout.tsx               -- Site-wide layout wrapper
  theme-provider.tsx            -- Dark/light theme provider
  chip-input.tsx                -- Tag/chip input component
  policies/
    effective-summary.tsx       -- Effective policy summary view
    policy-detail-drawer.tsx    -- Policy detail side drawer
    policy-form.tsx             -- Policy creation/edit form
  ui/                           -- shadcn/ui component library (60+ components)

hooks/
  use-mobile.ts                 -- Mobile detection hook
  use-toast.ts                  -- Toast notification hook

lib/
  utils.ts                      -- Utility functions (cn, etc.)
  store.ts                      -- State management
  mockData.ts                   -- Mock data for development/fallback
  i18n/                         -- Internationalization
    index.ts                    -- i18n configuration
    locales/
      en.json                   -- English translations
      ja.json                   -- Japanese translations
      zh-CN.json                -- Simplified Chinese translations
      zh-TW.json                -- Traditional Chinese translations
```

---

## 3. Data Flow Diagram

### 3.1 Static System Information Flow

```
+----------------+     execSync      +------------------+
|  macOS Commands| <---------------- |  system-info.js  |
|  (sysctl, etc) |  ----stdout--->   |  getStaticInfo() |
+----------------+                   +--------+---------+
                                              |
                                     structured object
                                              |
                                              v
                                  +-----------+-----------+
                                  |     IPC Handler       |
                                  |  'system:get-static-  |
                                  |   info'               |
                                  +-----------+-----------+
                                              |
                                    ipcMain.handle()
                                              |
                                              v
                                  +-----------+-----------+
                                  |    preload.js         |
                                  |  ipcRenderer.invoke() |
                                  +-----------+-----------+
                                              |
                                   electronAPI.
                                    getStaticInfo()
                                              |
                                              v
                                  +-----------+-----------+
                                  |  useStaticSystemInfo  |
                                  |  React Hook           |
                                  +-----------+-----------+
                                              |
                                     { data, loading,
                                       error, refetch }
                                              |
                                              v
                                  +-----------+-----------+
                                  |  Dashboard Page       |
                                  |  UI Components        |
                                  +------------------------+
```

### 3.2 Dynamic Metrics Polling Flow

```
  Renderer                    Main Process               macOS
  --------                    ------------               -----

  startPolling() -------->  system:start-polling
                                   |
                            setInterval(3000ms)
                                   |
                            +------+------+
                            |  Tick #1    |----------> getDynamicInfo()
                            |             |<---------- { freeRAM, CPU, ... }
                            +------+------+
                                   |
  onMetricsUpdate() <-----  system:metrics-update
  (callback with data)             |
                            +------+------+
                            |  Tick #2    |----------> getDynamicInfo()
                            |             |<---------- { freeRAM, CPU, ... }
                            +------+------+
                                   |
  onMetricsUpdate() <-----  system:metrics-update
                                  ...
                                   |
  stopPolling() ---------->  system:stop-polling
                                   |
                            clearInterval()
```

### 3.3 LLM Compatibility Flow

```
  +-------------------+     +----------------------+
  | useStaticSystem   |     | useDynamicSystem     |
  | Info() hook       |     | Info() hook          |
  +--------+----------+     +----------+-----------+
           |                           |
           v                           v
  +--------+----------+     +----------+-----------+
  | totalRAMBytes     |     | freeRAMBytes         |
  +--------+----------+     +----------+-----------+
           |                           |
           +-------------+-------------+
                         |
                         v
              +----------+-----------+
              |  LLM Compatibility   |
              |  Engine              |
              |                      |
              |  Input:              |
              |  - model catalog     |
              |  - totalRAMBytes     |
              |  - freeRAMBytes      |
              |  - parallelAgents    |
              |  - contextLength     |
              |                      |
              |  Output:             |
              |  - ok / heavy / ng   |
              |  - headroomBytes     |
              +----------+-----------+
                         |
                         v
              +----------+-----------+
              |  Models Page         |
              |  Compatibility Table |
              +----------------------+
```

---

## 4. IPC Channel Inventory

### 4.1 Channel List

| # | Channel Name | Direction | Pattern | Description |
| --- | --- | --- | --- | --- |
| 1 | `system:get-static-info` | Renderer -> Main | invoke/handle | Retrieve static hardware info |
| 2 | `system:get-dynamic-info` | Renderer -> Main | invoke/handle | Retrieve current dynamic metrics |
| 3 | `system:get-processes` | Renderer -> Main | invoke/handle | Retrieve running process list |
| 4 | `system:get-battery` | Renderer -> Main | invoke/handle | Retrieve battery status |
| 5 | `system:start-polling` | Renderer -> Main | send/on | Start dynamic metrics polling |
| 6 | `system:stop-polling` | Renderer -> Main | send/on | Stop dynamic metrics polling |
| 7 | `system:metrics-update` | Main -> Renderer | send/on | Push polled metrics to renderer |
| 8 | `system:kill-process` | Renderer -> Main | invoke/handle | Terminate a process by PID |
| 9 | `app:get-login-item-settings` | Renderer -> Main | invoke/handle | Get Open at Login state |
| 10 | `app:set-login-item-settings` | Renderer -> Main | invoke/handle | Set Open at Login state |

### 4.2 Channel Communication Patterns

```
Pattern 1: Request-Response (invoke/handle)
  Renderer: const result = await window.electronAPI.getStaticInfo()
  Preload:  ipcRenderer.invoke('system:get-static-info')
  Main:     ipcMain.handle('system:get-static-info', handler)

Pattern 2: Fire-and-Forget (send/on)
  Renderer: window.electronAPI.startPolling()
  Preload:  ipcRenderer.send('system:start-polling')
  Main:     ipcMain.on('system:start-polling', handler)

Pattern 3: Event Push (send/on - reverse direction)
  Main:     mainWindow.webContents.send('system:metrics-update', data)
  Preload:  ipcRenderer.on('system:metrics-update', callback)
  Renderer: window.electronAPI.onMetricsUpdate(callback)
```

### 4.3 Channel-to-Requirement Mapping

| Channel | Requirement(s) |
| --- | --- |
| system:get-static-info | FR-001, FR-003 |
| system:get-dynamic-info | FR-002, FR-003, FR-007 |
| system:get-processes | FR-004 |
| system:get-battery | FR-006 |
| system:start-polling | FR-007 |
| system:stop-polling | FR-007 |
| system:metrics-update | FR-002, FR-007 |
| system:kill-process | FR-004 |
| app:get-login-item-settings | FR-005 |
| app:set-login-item-settings | FR-005 |

---

## 5. Security Architecture

### 5.1 Process Isolation Model

```
+---------------------------+
|  Electron Main Process    |  <-- Full Node.js access
|  (Trusted)                |      System commands, file I/O
+-------------+-------------+
              |
        contextBridge
       (Security Boundary)
              |
+-------------+-------------+
|  Preload Script           |  <-- Limited API surface
|  (Semi-Trusted)           |      Only defined methods exposed
+-------------+-------------+
              |
       electronAPI
     (Frozen Object)
              |
+-------------+-------------+
|  Renderer Process         |  <-- No Node.js access
|  (Untrusted)              |      Web-standard APIs only
+---------------------------+
```

### 5.2 Security Controls Summary

| Control | Layer | Implementation |
| --- | --- | --- |
| Context Isolation | BrowserWindow | `contextIsolation: true` |
| No Node Integration | BrowserWindow | `nodeIntegration: false` |
| API Surface Limitation | Preload | Only 10 defined methods exposed |
| Input Validation | Main Process | All IPC parameters validated before execution |
| Process Kill Protection | Main Process | PID validation, error handling for protected processes |
| No External Loading | Main Process | `loadFile()` used instead of `loadURL()` |

---

## 6. Deployment Architecture

```
Source Code (TypeScript/React)
        |
        v
  Next.js Build (next build)
  Output: /out/ (static HTML/JS/CSS)
        |
        v
  Electron Packaging (electron-builder)
  Config: electron-builder.yml
        |
        +------> DMG (current distribution)
        |
        +------> Mac App Store (target distribution)
                   - Code signing
                   - Notarization
                   - Sandbox entitlements
```

---
---

## 日本語版 (Japanese)

# 04 - 基本設計書

| 項目           | 値                                         |
| -------------- | ------------------------------------------ |
| 文書ID         | HLD-001                                    |
| プロジェクト   | Secure Agent OS / OpenNeo                  |
| バージョン     | 1.0                                        |
| 日付           | 2026-02-22                                 |
| 作成者         | OpenNeo エンジニアリングチーム              |
| ステータス     | ドラフト                                   |
| 入力元         | 03_要件定義書                              |
| 出力先         | 05_詳細設計書, 06_テスト計画書             |

---

### 1. アーキテクチャ概要

#### 1.1 アーキテクチャ図

```
+===================================================================+
|                     OpenNeo アプリケーション                        |
+===================================================================+
|                                                                    |
|  +------------------------------+    +-------------------------+   |
|  |   Electron メインプロセス     |    |    macOS システム API   |   |
|  |                              |    |                         |   |
|  |  +------------------------+  |    |  sysctl                 |   |
|  |  |      main.js           |  |    |  system_profiler        |   |
|  |  |                        |  |    |  vm_stat                |   |
|  |  |  - BrowserWindow       |  |    |  ps aux                 |   |
|  |  |  - IPC ハンドラ        |<-------->  pmset -g batt        |   |
|  |  |  - アプリライフサイクル |  |    |  df -k                  |   |
|  |  +------------------------+  |    |  sw_vers                |   |
|  |              |               |    |  uname                  |   |
|  |  +------------------------+  |    +-------------------------+   |
|  |  |  system-info.js        |  |                                  |
|  |  |  (システム情報モジュール)|  |                                  |
|  |  +------------------------+  |                                  |
|  +-------------|----------------+                                  |
|                |                                                   |
|          IPC ブリッジ                                               |
|       (contextIsolation)                                           |
|                |                                                   |
|  +-------------|----------------+                                  |
|  |    プリロードスクリプト      |                                   |
|  |  contextBridge              |                                   |
|  |    .exposeInMainWorld       |                                   |
|  +-------------|----------------+                                  |
|                |                                                   |
|  +-------------|--------------------------------------------------+
|  |    レンダラープロセス (Next.js)                                 |
|  |                                                                |
|  |  +------------------+  +--------------------+  +------------+  |
|  |  | ダッシュボード    |  |  React Hooks       |  | LLMエンジン|  |
|  |  | ページ群         |  |                    |  |            |  |
|  |  +------------------+  +--------------------+  +------------+  |
|  |                                                                |
|  |  +----------------------------------------------------------+  |
|  |  |  UIコンポーネントライブラリ (shadcn/ui + Radix + Tailwind)|  |
|  |  +----------------------------------------------------------+  |
|  +----------------------------------------------------------------+
+====================================================================+
```

#### 1.2 レイヤー説明

| レイヤー | プロセス | 技術 | 責務 |
| --- | --- | --- | --- |
| **Electron メイン** | メイン (Node.js) | Node.js, child_process | システムAPIアクセス、IPC処理、ウィンドウ管理、アプリライフサイクル |
| **システム情報モジュール** | メイン (Node.js) | child_process.execSync | macOSコマンド実行、データパース、構造化出力 |
| **プリロード** | プリロード (分離) | contextBridge | メインとレンダラー間のセキュアなAPI面の公開 |
| **レンダラー** | レンダラー (Chromium) | Next.js 16, React 19 | UI描画、状態管理、ユーザーインタラクション |
| **React Hooks** | レンダラー | React hooks | データ取得抽象化、ポーリングライフサイクル、エラー処理 |
| **LLMエンジン** | レンダラー | 純粋TypeScript | 互換性計算、モデルカタログ管理 |
| **UIコンポーネント** | レンダラー | shadcn/ui, Radix, Tailwind | 再利用可能な視覚コンポーネント |

---

### 2. コンポーネント構造

#### 2.1 Electron メインプロセス

```
electron/
  main.js              -- アプリエントリポイント、BrowserWindow作成、IPCハンドラ登録
  preload.js           -- contextBridge API公開
  system-info.js       -- システム情報取得モジュール（計画中）
```

#### 2.2 レンダラー (Next.js アプリケーション)

```
app/
  layout.tsx                    -- ルートレイアウト
  page.tsx                      -- ランディングページ
  dashboard/
    layout.tsx                  -- ダッシュボードレイアウト（サイドバー + ヘッダー）
    page.tsx                    -- ダッシュボードホーム / システム概要
    models/page.tsx             -- LLMモデルカタログと互換性
    agents/page.tsx             -- エージェント管理
    policies/page.tsx           -- ポリシー管理
    audit/page.tsx              -- 監査ログビューア
    ...
```

---

### 3. データフロー図

#### 3.1 静的システム情報フロー

```
macOSコマンド → system-info.js → IPCハンドラ → preload.js → React Hook → UIコンポーネント
```

#### 3.2 動的メトリクスポーリングフロー

```
レンダラー startPolling() → メイン setInterval(3000ms) → getDynamicInfo() → metrics-update → レンダラー
```

#### 3.3 LLM互換性フロー

```
staticInfo + dynamicInfo → LLM互換性エンジン → ok/heavy/ng → モデルページ互換性テーブル
```

---

### 4. IPCチャネルインベントリ

| # | チャネル名 | 方向 | パターン | 説明 |
| --- | --- | --- | --- | --- |
| 1 | `system:get-static-info` | レンダラー → メイン | invoke/handle | 静的ハードウェア情報取得 |
| 2 | `system:get-dynamic-info` | レンダラー → メイン | invoke/handle | 現在の動的メトリクス取得 |
| 3 | `system:get-processes` | レンダラー → メイン | invoke/handle | 実行中プロセス一覧取得 |
| 4 | `system:get-battery` | レンダラー → メイン | invoke/handle | バッテリー状態取得 |
| 5 | `system:start-polling` | レンダラー → メイン | send/on | 動的メトリクスポーリング開始 |
| 6 | `system:stop-polling` | レンダラー → メイン | send/on | 動的メトリクスポーリング停止 |
| 7 | `system:metrics-update` | メイン → レンダラー | send/on | ポーリングされたメトリクスをレンダラーにプッシュ |
| 8 | `system:kill-process` | レンダラー → メイン | invoke/handle | PIDによるプロセス終了 |
| 9 | `app:get-login-item-settings` | レンダラー → メイン | invoke/handle | ログイン時起動状態の取得 |
| 10 | `app:set-login-item-settings` | レンダラー → メイン | invoke/handle | ログイン時起動状態の設定 |

#### チャネルと要件のマッピング

| チャネル | 要件 |
| --- | --- |
| system:get-static-info | FR-001, FR-003 |
| system:get-dynamic-info | FR-002, FR-003, FR-007 |
| system:get-processes | FR-004 |
| system:get-battery | FR-006 |
| system:start-polling | FR-007 |
| system:stop-polling | FR-007 |
| system:metrics-update | FR-002, FR-007 |
| system:kill-process | FR-004 |
| app:get-login-item-settings | FR-005 |
| app:set-login-item-settings | FR-005 |

---

### 5. セキュリティアーキテクチャ

#### 5.1 プロセス分離モデル

```
+---------------------------+
|  Electron メインプロセス   |  <-- フル Node.js アクセス
|  (信頼済み)               |      システムコマンド、ファイルI/O
+-------------+-------------+
              |
        contextBridge
       (セキュリティ境界)
              |
+-------------+-------------+
|  プリロードスクリプト      |  <-- 制限されたAPI面
|  (準信頼)                 |      定義されたメソッドのみ公開
+-------------+-------------+
              |
       electronAPI
     (凍結オブジェクト)
              |
+-------------+-------------+
|  レンダラープロセス        |  <-- Node.js アクセスなし
|  (非信頼)                 |      Web標準APIのみ
+---------------------------+
```

#### 5.2 セキュリティ統制サマリ

| 統制 | レイヤー | 実装 |
| --- | --- | --- |
| コンテキスト分離 | BrowserWindow | `contextIsolation: true` |
| Node統合無効 | BrowserWindow | `nodeIntegration: false` |
| API面の制限 | プリロード | 定義された10メソッドのみ公開 |
| 入力検証 | メインプロセス | 全IPCパラメータを実行前に検証 |
| プロセス終了保護 | メインプロセス | PID検証、保護プロセスのエラー処理 |
| 外部読込禁止 | メインプロセス | `loadURL()` の代わりに `loadFile()` を使用 |

---

### 6. デプロイアーキテクチャ

```
ソースコード (TypeScript/React)
        |
        v
  Next.js ビルド (next build)
  出力: /out/ (静的 HTML/JS/CSS)
        |
        v
  Electron パッケージング (electron-builder)
  設定: electron-builder.yml
        |
        +------> DMG（現行配布）
        |
        +------> Mac App Store（目標配布）
                   - コード署名
                   - 公証
                   - サンドボックスエンタイトルメント
```
