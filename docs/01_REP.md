# 01 - Requirements Engineering Plan (REP)

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| Document ID    | REP-001                                    |
| Project        | Secure Agent OS / OpenNeo                  |
| Version        | 1.0                                        |
| Date           | 2026-02-22                                 |
| Author         | OpenNeo Engineering Team                   |
| Status         | Draft                                      |
| Classification | Internal                                   |

---

## 1. Project Overview

**Secure Agent OS / OpenNeo** is a Mac desktop multi-agent management platform built with Electron and Next.js. The application provides a secure, local-first environment for managing AI agents, monitoring system resources, selecting compatible LLMs, enforcing policies, and maintaining audit trails.

### 1.1 Core Principles

| Principle            | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| **Local-first**      | Default processing occurs on-device; cloud transmission requires explicit consent |
| **Zero-trust**       | Agents, skills, and external connections operate under least-privilege with explicit authorization |
| **Mac-native**       | Optimized for macOS arm64 / Apple Silicon; App Store distribution target    |
| **Policy-based control** | All agent capabilities, data classifications, and network access governed by declarative policies |

### 1.2 Technology Stack

- **Desktop Shell**: Electron 35+
- **Frontend Framework**: Next.js 16 (React 19) with static export
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui components
- **Language**: TypeScript 5.7
- **Build**: electron-builder, pnpm workspace
- **Target**: macOS arm64 (Apple Silicon)

---

## 2. Document Hierarchy and Cross-References

All project engineering documents are organized in a linear traceability chain. Each downstream document derives from and traces back to upstream documents.

### 2.1 Document Map

```
source_gpt.md (RFP Source)
    |
    v
01_REP.md (This Document - Requirements Engineering Plan)
    |
    v
02_Requirements_Definition.md (Business-Level Requirements)
    |
    v
03_Requirements_Specification.md (Functional & Non-Functional Requirements)
    |
    v
04_High_Level_Design.md (Architecture & Component Design)
    |
    v
05_Detailed_Design.md (Interface Specs, Algorithms, Types)
    |
    v
06_Test_Plan.md (Test Strategy & Environment)
    |
    v
07_Test_Specification.md (Test Cases & Expected Results)
```

### 2.2 Traceability Matrix

| Document | ID | Traces From | Traces To |
| --- | --- | --- | --- |
| Requirements Engineering Plan | 01_REP | source_gpt.md (Sections 0-11) | 02, 03, 04, 05, 06, 07 |
| Requirements Definition | 02_RD | source_gpt.md (Sections 1-3), 01_REP | 03, 06 |
| Requirements Specification | 03_RS | source_gpt.md (Sections 4-7), 02_RD | 04, 05, 06, 07 |
| High-Level Design | 04_HLD | 03_RS | 05, 06 |
| Detailed Design | 05_DD | 03_RS, 04_HLD | 06, 07 |
| Test Plan | 06_TP | 03_RS, 04_HLD, 05_DD | 07 |
| Test Specification | 07_TS | 03_RS, 05_DD, 06_TP | (Execution reports) |

---

## 3. Stakeholder List

| ID | Stakeholder | Role | Interests | Engagement Level |
| --- | --- | --- | --- | --- |
| SH-001 | **Product Owner** | Decision maker, project sponsor | Feature scope, timeline, market fit | High - Approval authority |
| SH-002 | **End Users** | Mac power users, developers, AI practitioners | Usability, agent management, LLM compatibility | High - Primary feedback source |
| SH-003 | **Enterprise IT** | IT administrators in regulated industries | Security, compliance, MDM integration, audit trails | Medium - Requirements input |
| SH-004 | **Apple App Store Reviewers** | Apple review team | Sandbox compliance, privacy manifest, notarization, background process justification | Medium - Gatekeepers |
| SH-005 | **Security Auditors** | Third-party security assessors | Threat model, SBOM, supply chain integrity, SOC2 controls | Medium - Validation |
| SH-006 | **Development Team** | Engineers building OpenNeo | Technical feasibility, architecture clarity, testability | High - Implementation |
| SH-007 | **QA Team** | Quality assurance engineers | Test coverage, acceptance criteria, defect tracking | High - Verification |

---

## 4. Requirements Elicitation Process

### 4.1 Primary Source Analysis

The primary requirements source is `docs/source_gpt.md`, an RFP document structured as follows:

| Source Section | Content | Maps To |
| --- | --- | --- |
| Sections 0-1 | Background, purpose, concept statement | 02_RD (Business needs) |
| Section 2 | Scope (in/out) | 02_RD (Boundaries) |
| Section 3 | Current state (As-Is) | 02_RD (Baseline capabilities) |
| Section 4 | Target architecture requirements | 03_RS (NFR), 04_HLD |
| Section 5 | Functional requirements | 03_RS (FR) |
| Section 6 | Non-functional requirements | 03_RS (NFR) |
| Section 7 | Acceptance criteria | 02_RD, 03_RS |
| Sections 8-11 | Proposal structure, milestones, evaluation | 01_REP (Process) |

### 4.2 Elicitation Techniques

1. **Document Analysis**: Systematic review of source_gpt.md, extracting explicit and implicit requirements
2. **User Story Mapping**: Decompose high-level capabilities into user stories with acceptance criteria
3. **Codebase Inspection**: Review existing Electron main process, preload scripts, Next.js pages, and component structure to identify implemented vs. planned features
4. **Architecture Spike**: Validate IPC channel design, system info retrieval feasibility on macOS arm64
5. **Stakeholder Review**: Structured walkthrough with Product Owner for priority and scope confirmation

### 4.3 User Story Mapping Structure

```
Epics (source_gpt.md functional areas)
  |
  +-- Agent Management
  |     +-- US: Create/configure agent
  |     +-- US: Define agent roles and constraints
  |     +-- US: Monitor agent health
  |
  +-- LLM Selection & Compatibility
  |     +-- US: View compatible LLMs for hardware
  |     +-- US: Assess parallel agent capacity
  |     +-- US: Select context length
  |
  +-- System Monitoring
  |     +-- US: View static system info
  |     +-- US: Monitor real-time metrics
  |     +-- US: Manage processes
  |     +-- US: Check battery status
  |
  +-- Policy Enforcement
  |     +-- US: Create/edit policies
  |     +-- US: Assign policies to agents
  |     +-- US: View effective policy summary
  |
  +-- Audit Logging
        +-- US: View audit trail
        +-- US: Export audit logs
        +-- US: Verify log integrity
```

---

## 5. Requirements Analysis and Validation Process

### 5.1 Analysis Activities

| Activity | Description | Output |
| --- | --- | --- |
| **Categorization** | Classify each requirement as Functional (FR) or Non-Functional (NFR) | Categorized requirement list (03_RS) |
| **Prioritization** | Assign MoSCoW priority (Must/Should/Could/Won't) based on Product Owner input | Prioritized backlog |
| **Dependency Mapping** | Identify inter-requirement dependencies and ordering constraints | Dependency graph |
| **Feasibility Check** | Validate against Electron/macOS capabilities, App Store guidelines | Feasibility notes |
| **Conflict Resolution** | Detect and resolve contradictions between requirements | Resolution log |

### 5.2 Validation Criteria

Every requirement in 03_RS must satisfy the following quality attributes:

- **Unambiguous**: Single interpretation possible
- **Testable**: Clear pass/fail criteria exist (mapped in 07_TS)
- **Traceable**: Links to source_gpt.md section and downstream design/test documents
- **Consistent**: No conflicts with other requirements
- **Feasible**: Implementable within the current technology stack

### 5.3 Review and Approval Process

```
Draft Requirements
      |
      v
  Internal Review (Development + QA)
      |
      v
  Stakeholder Review (Product Owner + Enterprise IT)
      |
      v
  Approved Requirements Baseline
      |
      v
  Change Control (via version-controlled docs in /docs/)
```

### 5.4 Change Management

- All documents are version-controlled in the project Git repository under `/docs/`
- Changes to approved requirements require a documented rationale and re-approval
- Traceability matrix (Section 2.2) must be updated upon any requirement change

---

## 6. Glossary

| Term | Definition |
| --- | --- |
| IPC | Inter-Process Communication (Electron main <-> renderer) |
| LLM | Large Language Model |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| MoSCoW | Must have, Should have, Could have, Won't have (prioritization) |
| SBOM | Software Bill of Materials |
| PII | Personally Identifiable Information |
| MDM | Mobile Device Management |
| STRIDE | Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege |

---

## 7. References

| Ref | Document | Location |
| --- | --- | --- |
| R-001 | RFP Source Document | `docs/source_gpt.md` |
| R-002 | Electron Main Process | `electron/main.js` |
| R-003 | Electron Preload Script | `electron/preload.js` |
| R-004 | Package Configuration | `package.json` |
| R-005 | Apple App Store Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ |

---
---

## 日本語版 (Japanese)

# 01 - 要求工学計画書 (REP)

| 項目           | 値                                         |
| -------------- | ------------------------------------------ |
| 文書ID         | REP-001                                    |
| プロジェクト   | Secure Agent OS / OpenNeo                  |
| バージョン     | 1.0                                        |
| 日付           | 2026-02-22                                 |
| 作成者         | OpenNeo エンジニアリングチーム              |
| ステータス     | ドラフト                                   |
| 分類           | 内部文書                                   |

---

### 1. プロジェクト概要

**Secure Agent OS / OpenNeo** は、Electron と Next.js で構築された Mac デスクトップ向けマルチエージェント管理プラットフォームです。AIエージェントの管理、システムリソースの監視、互換性のあるLLMの選択、ポリシーの適用、監査証跡の維持を安全かつローカルファーストな環境で提供します。

#### 1.1 コア原則

| 原則                   | 説明                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| **ローカルファースト** | デフォルトはデバイス上で処理。クラウド送信には明示的な同意が必要       |
| **ゼロトラスト**       | エージェント・スキル・外部接続は最小権限・明示的許可で動作             |
| **Mac ネイティブ**     | macOS arm64 / Apple Silicon に最適化。App Store 配布を目標            |
| **ポリシーベース制御** | エージェントの能力、データ分類、ネットワークアクセスを宣言的ポリシーで制御 |

#### 1.2 技術スタック

- **デスクトップシェル**: Electron 35+
- **フロントエンドフレームワーク**: Next.js 16 (React 19) スタティックエクスポート
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui コンポーネント
- **言語**: TypeScript 5.7
- **ビルド**: electron-builder, pnpm ワークスペース
- **対象**: macOS arm64 (Apple Silicon)

---

### 2. 文書階層とクロスリファレンス

全プロジェクトエンジニアリング文書は、線形のトレーサビリティチェーンで構成されます。

#### 2.1 文書マップ

```
source_gpt.md (RFP ソース)
    |
    v
01_REP.md (本文書 - 要求工学計画書)
    |
    v
02_Requirements_Definition.md (要求定義書)
    |
    v
03_Requirements_Specification.md (要件定義書)
    |
    v
04_High_Level_Design.md (基本設計書)
    |
    v
05_Detailed_Design.md (詳細設計書)
    |
    v
06_Test_Plan.md (テスト計画書)
    |
    v
07_Test_Specification.md (テスト仕様書)
```

#### 2.2 トレーサビリティマトリクス

| 文書 | ID | 入力元 | 出力先 |
| --- | --- | --- | --- |
| 要求工学計画書 | 01_REP | source_gpt.md (セクション 0-11) | 02, 03, 04, 05, 06, 07 |
| 要求定義書 | 02_RD | source_gpt.md (セクション 1-3), 01_REP | 03, 06 |
| 要件定義書 | 03_RS | source_gpt.md (セクション 4-7), 02_RD | 04, 05, 06, 07 |
| 基本設計書 | 04_HLD | 03_RS | 05, 06 |
| 詳細設計書 | 05_DD | 03_RS, 04_HLD | 06, 07 |
| テスト計画書 | 06_TP | 03_RS, 04_HLD, 05_DD | 07 |
| テスト仕様書 | 07_TS | 03_RS, 05_DD, 06_TP | (実行報告書) |

---

### 3. ステークホルダー一覧

| ID | ステークホルダー | 役割 | 関心事項 | 関与度 |
| --- | --- | --- | --- | --- |
| SH-001 | **プロダクトオーナー** | 意思決定者・プロジェクトスポンサー | 機能範囲、スケジュール、市場適合性 | 高 - 承認権限 |
| SH-002 | **エンドユーザー** | Mac パワーユーザー、開発者、AI実務者 | ユーザビリティ、エージェント管理、LLM互換性 | 高 - 主要フィードバック源 |
| SH-003 | **企業IT部門** | 規制産業のIT管理者 | セキュリティ、コンプライアンス、MDM統合、監査証跡 | 中 - 要件入力 |
| SH-004 | **Apple App Store 審査員** | Apple審査チーム | Sandbox準拠、プライバシーマニフェスト、公証、バックグラウンドプロセスの妥当性 | 中 - ゲートキーパー |
| SH-005 | **セキュリティ監査人** | 第三者セキュリティ評価者 | 脅威モデル、SBOM、供給網の完全性、SOC2統制 | 中 - 検証 |
| SH-006 | **開発チーム** | OpenNeo を構築するエンジニア | 技術的実現可能性、アーキテクチャの明確性、テスト容易性 | 高 - 実装 |
| SH-007 | **QAチーム** | 品質保証エンジニア | テストカバレッジ、受入基準、欠陥追跡 | 高 - 検証 |

---

### 4. 要求抽出プロセス

#### 4.1 一次ソース分析

主要な要求ソースは `docs/source_gpt.md`（RFP文書）です。

| ソースセクション | 内容 | マッピング先 |
| --- | --- | --- |
| セクション 0-1 | 背景、目的、コンセプト | 02_RD (ビジネスニーズ) |
| セクション 2 | スコープ (対象/非対象) | 02_RD (境界) |
| セクション 3 | 現状 (As-Is) | 02_RD (ベースライン能力) |
| セクション 4 | 目標アーキテクチャ要件 | 03_RS (NFR), 04_HLD |
| セクション 5 | 機能要件 | 03_RS (FR) |
| セクション 6 | 非機能要件 | 03_RS (NFR) |
| セクション 7 | 受入条件 | 02_RD, 03_RS |
| セクション 8-11 | 提案構成、マイルストーン、評価 | 01_REP (プロセス) |

#### 4.2 抽出技法

1. **文書分析**: source_gpt.md の体系的レビュー、明示的・暗黙的要求の抽出
2. **ユーザーストーリーマッピング**: 高レベル機能をユーザーストーリーと受入基準に分解
3. **コードベース調査**: 既存の Electron メインプロセス、プリロードスクリプト、Next.js ページ、コンポーネント構造をレビュー
4. **アーキテクチャスパイク**: IPC チャネル設計、macOS arm64 でのシステム情報取得可能性の検証
5. **ステークホルダーレビュー**: プロダクトオーナーとの構造化ウォークスルーで優先度とスコープを確認

#### 4.3 ユーザーストーリーマッピング構造

```
エピック (source_gpt.md の機能領域)
  |
  +-- エージェント管理
  |     +-- US: エージェントの作成・設定
  |     +-- US: エージェントの役割と制約の定義
  |     +-- US: エージェントの稼働状態監視
  |
  +-- LLM 選択・互換性
  |     +-- US: ハードウェア互換LLMの表示
  |     +-- US: 並列エージェント容量の評価
  |     +-- US: コンテキスト長の選択
  |
  +-- システム監視
  |     +-- US: 静的システム情報の表示
  |     +-- US: リアルタイムメトリクスの監視
  |     +-- US: プロセス管理
  |     +-- US: バッテリー状態の確認
  |
  +-- ポリシー適用
  |     +-- US: ポリシーの作成・編集
  |     +-- US: エージェントへのポリシー割当
  |     +-- US: 有効ポリシーサマリの表示
  |
  +-- 監査ログ
        +-- US: 監査証跡の表示
        +-- US: 監査ログのエクスポート
        +-- US: ログ完全性の検証
```

---

### 5. 要求分析・検証プロセス

#### 5.1 分析活動

| 活動 | 説明 | 出力 |
| --- | --- | --- |
| **分類** | 各要求を機能要件(FR)または非機能要件(NFR)に分類 | 分類済み要求リスト (03_RS) |
| **優先度付け** | プロダクトオーナーの入力に基づきMoSCoW優先度を割当 | 優先度付きバックログ |
| **依存関係マッピング** | 要求間の依存関係と順序制約を特定 | 依存関係グラフ |
| **実現可能性確認** | Electron/macOS 機能・App Store ガイドラインに対する検証 | 実現可能性メモ |
| **競合解決** | 要求間の矛盾を検出・解決 | 解決ログ |

#### 5.2 検証基準

03_RS の全要求は以下の品質属性を満たす必要があります：

- **明確性**: 単一の解釈のみが可能
- **テスト可能性**: 明確な合否基準が存在 (07_TS にマッピング)
- **トレーサビリティ**: source_gpt.md セクションおよび下流の設計・テスト文書へのリンク
- **一貫性**: 他の要求との矛盾がない
- **実現可能性**: 現在の技術スタックで実装可能

#### 5.3 レビュー・承認プロセス

```
要求ドラフト
      |
      v
  内部レビュー (開発 + QA)
      |
      v
  ステークホルダーレビュー (プロダクトオーナー + 企業IT)
      |
      v
  承認済み要求ベースライン
      |
      v
  変更管理 (/docs/ 配下のバージョン管理文書による)
```

#### 5.4 変更管理

- 全文書はプロジェクト Git リポジトリの `/docs/` 配下でバージョン管理
- 承認済み要求の変更には文書化された理由と再承認が必要
- 要求変更時にはトレーサビリティマトリクス（セクション 2.2）を更新

---

### 6. 用語集

| 用語 | 定義 |
| --- | --- |
| IPC | プロセス間通信 (Electron メイン <-> レンダラー) |
| LLM | 大規模言語モデル |
| FR | 機能要件 |
| NFR | 非機能要件 |
| MoSCoW | Must have, Should have, Could have, Won't have (優先度付け手法) |
| SBOM | ソフトウェア部品表 |
| PII | 個人識別情報 |
| MDM | モバイルデバイス管理 |
| STRIDE | なりすまし、改ざん、否認、情報漏洩、サービス拒否、権限昇格 |

---

### 7. 参考文献

| 参照 | 文書 | 場所 |
| --- | --- | --- |
| R-001 | RFP ソース文書 | `docs/source_gpt.md` |
| R-002 | Electron メインプロセス | `electron/main.js` |
| R-003 | Electron プリロードスクリプト | `electron/preload.js` |
| R-004 | パッケージ設定 | `package.json` |
| R-005 | Apple App Store 審査ガイドライン | https://developer.apple.com/app-store/review/guidelines/ |
