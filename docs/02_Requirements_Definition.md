# 02 - Requirements Definition

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document ID    | RD-001                                     |
| Project        | Secure Agent OS / OpenNeo                  |
| Version        | 1.0                                        |
| Date           | 2026-02-22                                 |
| Author         | OpenNeo Engineering Team                   |
| Status         | Draft                                      |
| Traces From    | source_gpt.md (Sections 1-3), 01_REP      |
| Traces To      | 03_Requirements_Specification, 06_Test_Plan |

---

## 1. Business-Level Needs

### 1.1 Background (source_gpt.md Section 1)

OpenNeo is a self-built multi-agent platform running as a Mac desktop application. It has achieved DMG-distributable status with the following operational capabilities: skills execution, coding agent, automation, agent-to-agent conversation, direct messaging, and heartbeat-based persistent operation.

### 1.2 Purpose

The project aims to:

1. **Elevate to App Store quality**: Meet Apple's security, compliance, and quality standards for Mac App Store distribution
2. **Enterprise readiness**: Achieve "Secure Agent OS" status suitable for enterprise use in regulated industries
3. **Multi-provider LLM support**: Provide hardware-aware compatibility assessment for local and cloud LLMs
4. **System transparency**: Give users full visibility into their Mac's hardware capabilities, resource usage, and running processes

### 1.3 Scope Boundaries

**In Scope:**
- Mac desktop application (current DMG to Mac App Store target)
- Secure agent platform design (Local-first / Zero-trust / Policy-based)
- Audit logging, permissions, key management, data classification
- Supply chain security (SBOM / signing / notarization / CI/CD)
- System monitoring dashboard (CPU, RAM, GPU, disk, battery, processes)
- LLM compatibility detection engine

**Out of Scope:**
- Forced lock-in to a specific cloud provider
- Per-enterprise custom development (separate SOW)
- Exclusive model provider contracts (multi-provider support is fundamental)

---

## 2. Core Philosophy

### 2.1 Local-First

All default processing occurs on the user's device. No data leaves the machine without explicit, informed user consent. This principle applies to:
- Agent execution and inter-agent communication
- System information collection and display
- LLM inference (local models preferred; cloud API calls require opt-in)
- Audit log storage

### 2.2 Zero-Trust

Every component operates under the assumption that no other component is inherently trusted:
- Agents receive only the permissions explicitly granted by policy
- Skills/plugins execute in sandboxed environments with declared capabilities
- External network connections require explicit domain allowlisting
- IPC channels enforce context isolation between Electron main and renderer processes

### 2.3 Mac-Native

The application is designed exclusively for macOS with Apple Silicon optimization:
- Native Electron window with `hiddenInset` title bar and traffic light positioning
- Apple Keychain / Secure Enclave integration for secrets management
- macOS-specific system information retrieval (sysctl, system_profiler, powermetrics)
- App Sandbox compliance for App Store distribution
- Notarization and code signing

---

## 3. User Stories

### 3.1 Agent Management

| US ID | User Story | Priority |
| --- | --- | --- |
| US-AM-001 | As a user, I want to view a list of all registered agents so that I can understand what agents are available in my system. | Must |
| US-AM-002 | As a user, I want to create a new agent with a defined role, purpose, constraints, and available tools so that I can customize agent behavior. | Must |
| US-AM-003 | As a user, I want to monitor the health and status of running agents so that I can detect issues early. | Must |
| US-AM-004 | As a user, I want to start, stop, and restart agents so that I can control their lifecycle. | Must |
| US-AM-005 | As a user, I want to configure agent-to-agent communication channels so that agents can collaborate on tasks. | Should |

**Acceptance Criteria for US-AM-001:**
- Dashboard displays agent name, status (running/stopped/error), and assigned role
- List refreshes automatically when agent state changes
- Empty state is shown when no agents are configured

**Acceptance Criteria for US-AM-002:**
- Form validates required fields (name, role) before submission
- Constraints and tool permissions are selectable from policy-defined options
- Newly created agent appears in the agent list immediately

**Acceptance Criteria for US-AM-003:**
- Health indicators show CPU usage, memory consumption, and uptime per agent
- Heartbeat status is displayed with last-seen timestamp
- Error state triggers a visual alert in the dashboard

**Acceptance Criteria for US-AM-004:**
- Start/stop/restart actions are available from the agent detail view
- Confirmation dialog appears before stopping a running agent
- State transitions are logged in the audit trail

**Acceptance Criteria for US-AM-005:**
- User can define allowed communication pairs between agents
- Messages between agents are logged when audit mode is enabled
- DM (direct message) channels are encrypted

---

### 3.2 LLM Selection and Compatibility

| US ID | User Story | Priority |
| --- | --- | --- |
| US-LLM-001 | As a user, I want to see which LLMs are compatible with my Mac hardware so that I can choose appropriate models. | Must |
| US-LLM-002 | As a user, I want to understand the compatibility status (ok/heavy/ng) for each model so that I can make informed decisions. | Must |
| US-LLM-003 | As a user, I want to adjust the number of parallel agents and context length to see how compatibility changes so that I can plan resource allocation. | Should |
| US-LLM-004 | As a user, I want to view model details (parameter count, quantization, required RAM) so that I can understand model requirements. | Should |

**Acceptance Criteria for US-LLM-001:**
- Model catalog displays all supported LLMs with compatibility indicators
- Compatibility is calculated based on actual hardware (total RAM, free RAM)
- Results update when system memory state changes

**Acceptance Criteria for US-LLM-002:**
- Three-tier status system: "ok" (green), "heavy" (yellow), "ng" (red)
- "ok" means >= 2GB headroom after model loading
- "heavy" means model fits but headroom < 2GB
- "ng" means model does not fit in available memory

**Acceptance Criteria for US-LLM-003:**
- Sliders or inputs for parallel agent count and context length
- Compatibility results recalculate in real-time as parameters change
- Effective RAM calculation accounts for parallel agent overhead (30% per additional agent)

**Acceptance Criteria for US-LLM-004:**
- Detail view shows model name, provider, parameter count, quantization level, required RAM, and supported context lengths

---

### 3.3 System Monitoring

| US ID | User Story | Priority |
| --- | --- | --- |
| US-SM-001 | As a user, I want to view my Mac's static system information (CPU, GPU, RAM, disk, OS) so that I understand my hardware capabilities. | Must |
| US-SM-002 | As a user, I want to see real-time memory pressure and CPU load so that I can monitor system health. | Must |
| US-SM-003 | As a user, I want to view and manage running processes (list, sort, kill) so that I can control resource usage. | Must |
| US-SM-004 | As a user, I want to see battery status (percentage, charging state, time remaining) so that I can plan my work. | Should |
| US-SM-005 | As a user, I want to control whether the app opens at login so that I can configure startup behavior. | Should |
| US-SM-006 | As a user, I want dynamic metrics to auto-refresh at regular intervals so that I see current data without manual refresh. | Must |

**Acceptance Criteria for US-SM-001:**
- Displays: CPU model, chip generation, GPU core count, total RAM, disk total/free, OS version, architecture
- Data is fetched once on page load and can be manually refreshed
- Graceful fallback when Electron API is unavailable (browser dev mode)

**Acceptance Criteria for US-SM-002:**
- Memory pressure indicator shows: normal / warn / critical
- CPU load displayed as percentage with visual gauge
- Updates every 3 seconds via polling

**Acceptance Criteria for US-SM-003:**
- Process list shows: PID, parent PID, CPU%, RAM usage, command name
- Sortable by any column
- Kill button with confirmation dialog; result (success/error) displayed to user

**Acceptance Criteria for US-SM-004:**
- Shows battery percentage, charging/discharging state, estimated time remaining
- Handles "calculating" state gracefully
- Updates with dynamic metrics polling

**Acceptance Criteria for US-SM-005:**
- Toggle switch for "Open at Login" setting
- Current state is retrieved from system on load
- Change takes effect immediately (persists across restarts)

**Acceptance Criteria for US-SM-006:**
- 3-second polling interval for dynamic metrics
- Polling starts when dashboard is visible and stops when navigated away
- Metric update does not block UI rendering

---

### 3.4 Policy Enforcement

| US ID | User Story | Priority |
| --- | --- | --- |
| US-PE-001 | As a user, I want to create policies that define what skills/tools an agent can use so that I can enforce least-privilege. | Must |
| US-PE-002 | As a user, I want to define data classification policies (e.g., "external transmission prohibited") so that sensitive data stays local. | Must |
| US-PE-003 | As a user, I want to assign network access policies (domain allowlists) to agents so that I can control external communication. | Should |
| US-PE-004 | As a user, I want to view the effective policy summary for any agent so that I can verify the combined effect of all assigned policies. | Must |

**Acceptance Criteria for US-PE-001:**
- Policy editor supports tool/skill selection from a capability catalog
- Policies can be assigned to one or more agents
- Policy violations are blocked and logged

**Acceptance Criteria for US-PE-002:**
- Data classification levels are configurable (e.g., public, internal, confidential, restricted)
- Outbound data is checked against classification before transmission
- Violations produce audit log entries

**Acceptance Criteria for US-PE-003:**
- Domain allowlist is configurable per policy
- Agents cannot make network requests to non-allowed domains
- Blocked requests are logged with source agent and target domain

**Acceptance Criteria for US-PE-004:**
- Effective summary merges all assigned policies into a single readable view
- Conflicts between policies are highlighted
- Summary is accessible from the agent detail view

---

### 3.5 Audit Logging

| US ID | User Story | Priority |
| --- | --- | --- |
| US-AL-001 | As a user, I want all agent actions to be recorded in an audit log so that I have a complete trail of activity. | Must |
| US-AL-002 | As a user, I want to search and filter audit logs by agent, time range, and action type so that I can investigate specific events. | Must |
| US-AL-003 | As a user, I want to export audit logs in a standard format so that external tools can consume them. | Should |
| US-AL-004 | As an enterprise IT administrator, I want audit logs to be tamper-resistant (hash chain) so that log integrity is verifiable. | Should |

**Acceptance Criteria for US-AL-001:**
- Every agent start, stop, skill invocation, policy violation, and data access is logged
- Log entries include: timestamp, agent ID, action, target, result, policy context
- Logs persist across application restarts

**Acceptance Criteria for US-AL-002:**
- Filter UI supports: agent name, date range, action type, severity
- Results are paginated for performance
- Full-text search is available on log messages

**Acceptance Criteria for US-AL-003:**
- Export to JSON and CSV formats
- Export respects current filter criteria
- Exported files include metadata (export date, filter parameters, entry count)

**Acceptance Criteria for US-AL-004:**
- Each log entry includes a cryptographic hash of the previous entry (hash chain)
- Verification function can detect any tampering in the chain
- Hash algorithm is SHA-256 or stronger

---

## 4. Requirement Priority Summary

| Priority | Count | Description |
| --- | --- | --- |
| **Must** | 14 | Core functionality required for MVP |
| **Should** | 8 | Important features for complete user experience |
| **Could** | 0 | Nice-to-have (none defined at this stage) |
| **Won't** | 0 | Explicitly excluded (documented in scope boundaries) |

---

## 5. Assumptions and Constraints

### 5.1 Assumptions

1. Target hardware is Apple Silicon Mac (M1 or later) with at least 8GB unified memory
2. Users have macOS 13 (Ventura) or later installed
3. Electron provides sufficient macOS system API access for all required system information
4. App Store sandbox restrictions are compatible with the defined feature set (with appropriate entitlements)

### 5.2 Constraints

1. **App Store compliance**: All features must conform to Apple App Store Review Guidelines
2. **No nodeIntegration**: Renderer process must not have direct Node.js access (context isolation enforced)
3. **Local-first default**: No network calls without explicit user opt-in
4. **macOS arm64 only**: No cross-platform support in initial release

---
---

## 日本語版 (Japanese)

# 02 - 要求定義書

| 項目           | 値                                         |
| -------------- | ------------------------------------------ |
| 文書ID         | RD-001                                     |
| プロジェクト   | Secure Agent OS / OpenNeo                  |
| バージョン     | 1.0                                        |
| 日付           | 2026-02-22                                 |
| 作成者         | OpenNeo エンジニアリングチーム              |
| ステータス     | ドラフト                                   |
| 入力元         | source_gpt.md (セクション 1-3), 01_REP     |
| 出力先         | 03_要件定義書, 06_テスト計画書              |

---

### 1. ビジネスレベルのニーズ

#### 1.1 背景 (source_gpt.md セクション 1)

OpenNeo は、Mac デスクトップアプリケーションとして動作する自作マルチエージェント基盤です。DMG 配布可能な状態に到達しており、以下の運用機能を備えています：スキル実行、コーディングエージェント、自動化、エージェント間会話、ダイレクトメッセージ、ハートビートベースの常駐動作。

#### 1.2 目的

1. **App Store 品質への引き上げ**: Apple のセキュリティ・コンプライアンス・品質基準を満たし Mac App Store 配布を実現
2. **企業利用対応**: 規制産業でも使用可能な「セキュアエージェント OS」の地位を確立
3. **マルチプロバイダー LLM サポート**: ハードウェア対応の互換性評価をローカル・クラウド LLM に提供
4. **システム透明性**: ユーザーに Mac のハードウェア能力、リソース使用状況、実行中プロセスの完全な可視性を提供

#### 1.3 スコープ境界

**対象:**
- Mac デスクトップアプリケーション（現行 DMG から Mac App Store 目標）
- セキュアエージェント基盤設計（ローカルファースト / ゼロトラスト / ポリシーベース）
- 監査ログ、権限、鍵管理、データ分類
- 供給網セキュリティ（SBOM / 署名 / 公証 / CI/CD）
- システム監視ダッシュボード（CPU、RAM、GPU、ディスク、バッテリー、プロセス）
- LLM 互換性検出エンジン

**非対象:**
- 特定クラウドプロバイダーへの強制ロックイン
- 企業ごとの個別開発（別途 SOW）
- 排他的モデルプロバイダー契約（マルチプロバイダー対応が基本）

---

### 2. コア哲学

#### 2.1 ローカルファースト

全てのデフォルト処理はユーザーのデバイス上で実行されます。明示的かつ十分な情報に基づくユーザー同意なしにデータがマシンから外部に出ることはありません。

#### 2.2 ゼロトラスト

全コンポーネントは、他のコンポーネントが本質的に信頼できないという前提で動作します：
- エージェントはポリシーで明示的に付与された権限のみを取得
- スキル/プラグインは宣言された機能でサンドボックス環境内実行
- 外部ネットワーク接続は明示的なドメイン許可リストが必要
- IPC チャネルは Electron メインとレンダラープロセス間のコンテキスト分離を強制

#### 2.3 Mac ネイティブ

Apple Silicon 最適化で macOS 専用に設計：
- `hiddenInset` タイトルバーとトラフィックライト配置のネイティブ Electron ウィンドウ
- シークレット管理のための Apple Keychain / Secure Enclave 統合
- macOS 固有のシステム情報取得（sysctl、system_profiler、powermetrics）
- App Store 配布のための App Sandbox 準拠
- 公証とコード署名

---

### 3. ユーザーストーリー

#### 3.1 エージェント管理

| US ID | ユーザーストーリー | 優先度 |
| --- | --- | --- |
| US-AM-001 | ユーザーとして、システムで利用可能なエージェントを把握するために、全登録エージェントの一覧を表示したい。 | Must |
| US-AM-002 | ユーザーとして、エージェントの動作をカスタマイズするために、役割・目的・制約・利用可能ツールを定義して新しいエージェントを作成したい。 | Must |
| US-AM-003 | ユーザーとして、問題を早期に検出するために、実行中エージェントの稼働状態とステータスを監視したい。 | Must |
| US-AM-004 | ユーザーとして、エージェントのライフサイクルを制御するために、エージェントの開始・停止・再起動を行いたい。 | Must |
| US-AM-005 | ユーザーとして、エージェントがタスクで協力できるように、エージェント間通信チャネルを設定したい。 | Should |

#### 3.2 LLM 選択・互換性

| US ID | ユーザーストーリー | 優先度 |
| --- | --- | --- |
| US-LLM-001 | ユーザーとして、適切なモデルを選択するために、自分の Mac ハードウェアと互換性のある LLM を確認したい。 | Must |
| US-LLM-002 | ユーザーとして、情報に基づいた判断をするために、各モデルの互換性ステータス（ok/heavy/ng）を理解したい。 | Must |
| US-LLM-003 | ユーザーとして、リソース配分を計画するために、並列エージェント数とコンテキスト長を調整して互換性の変化を確認したい。 | Should |
| US-LLM-004 | ユーザーとして、モデル要件を理解するために、モデル詳細（パラメータ数、量子化、必要RAM）を表示したい。 | Should |

#### 3.3 システム監視

| US ID | ユーザーストーリー | 優先度 |
| --- | --- | --- |
| US-SM-001 | ユーザーとして、ハードウェア能力を理解するために、Mac の静的システム情報（CPU、GPU、RAM、ディスク、OS）を表示したい。 | Must |
| US-SM-002 | ユーザーとして、システムの健全性を監視するために、リアルタイムのメモリプレッシャーと CPU 負荷を確認したい。 | Must |
| US-SM-003 | ユーザーとして、リソース使用を制御するために、実行中プロセスの表示・ソート・強制終了を行いたい。 | Must |
| US-SM-004 | ユーザーとして、作業計画を立てるために、バッテリー状態（残量、充電状態、残り時間）を確認したい。 | Should |
| US-SM-005 | ユーザーとして、起動動作を設定するために、アプリのログイン時起動を制御したい。 | Should |
| US-SM-006 | ユーザーとして、手動更新なしで最新データを見るために、動的メトリクスが定期的に自動更新されてほしい。 | Must |

#### 3.4 ポリシー適用

| US ID | ユーザーストーリー | 優先度 |
| --- | --- | --- |
| US-PE-001 | ユーザーとして、最小権限を強制するために、エージェントが使用できるスキル/ツールを定義するポリシーを作成したい。 | Must |
| US-PE-002 | ユーザーとして、機密データをローカルに保持するために、データ分類ポリシー（例：「外部送信禁止」）を定義したい。 | Must |
| US-PE-003 | ユーザーとして、外部通信を制御するために、エージェントにネットワークアクセスポリシー（ドメイン許可リスト）を割り当てたい。 | Should |
| US-PE-004 | ユーザーとして、全割当ポリシーの複合効果を検証するために、任意のエージェントの有効ポリシーサマリを表示したい。 | Must |

#### 3.5 監査ログ

| US ID | ユーザーストーリー | 優先度 |
| --- | --- | --- |
| US-AL-001 | ユーザーとして、活動の完全な証跡を持つために、全エージェントアクションを監査ログに記録したい。 | Must |
| US-AL-002 | ユーザーとして、特定のイベントを調査するために、エージェント・時間範囲・アクションタイプで監査ログを検索・フィルタリングしたい。 | Must |
| US-AL-003 | ユーザーとして、外部ツールで利用するために、標準フォーマットで監査ログをエクスポートしたい。 | Should |
| US-AL-004 | 企業IT管理者として、ログの完全性を検証可能にするために、監査ログが改ざん耐性（ハッシュチェーン）を持つことを求める。 | Should |

---

### 4. 要求優先度サマリ

| 優先度 | 件数 | 説明 |
| --- | --- | --- |
| **Must** | 14 | MVP に必要なコア機能 |
| **Should** | 8 | 完全なユーザー体験のための重要機能 |
| **Could** | 0 | あると良い（この段階では未定義） |
| **Won't** | 0 | 明示的に除外（スコープ境界に記載） |

---

### 5. 前提条件と制約

#### 5.1 前提条件

1. ターゲットハードウェアは Apple Silicon Mac（M1以降）、ユニファイドメモリ8GB以上
2. macOS 13（Ventura）以降がインストール済み
3. Electron が必要な全システム情報に対する十分な macOS システム API アクセスを提供
4. App Store サンドボックス制限が定義された機能セットと互換（適切なエンタイトルメント使用）

#### 5.2 制約

1. **App Store 準拠**: 全機能が Apple App Store Review Guidelines に適合必須
2. **nodeIntegration 無効**: レンダラープロセスは直接 Node.js アクセス不可（コンテキスト分離強制）
3. **ローカルファーストデフォルト**: 明示的なユーザーオプトインなしのネットワーク通信禁止
4. **macOS arm64 限定**: 初回リリースではクロスプラットフォーム非対応
