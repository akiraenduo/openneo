# OpenNeo

**User-Owned Agent OS for macOS**

Local-first. Transparent. 24/7 autonomous agents with a Task Manager you can trust.

## Overview

OpenNeo is a macOS desktop application that lets you run, monitor, and control AI agents entirely on your machine. Built on a local-first architecture, it keeps your data on your device while providing full visibility into what every agent is doing — CPU, RAM, network, file access, and more.

## Features

- **Agent Task Manager** — Monitor CPU / RAM / network per agent in real time. Transparency like macOS Activity Monitor.
- **Local LLM First** — Prioritize OSS local models. Inference runs on your Mac, keeping data from leaving your device.
- **Explicit Cloud Approval** — All external API calls to Claude, GPT, etc. require explicit user approval.
- **OKR-driven Agents** — Set goals (OKRs) for each agent. Scheduled execution and heartbeat for autonomous operation.
- **Skills & Automation** — Assign and auto-generate skills. Agents acquire capabilities and automate tasks.
- **Privacy by Design** — No data collection by default. All access is policy-controlled and logged in audit trails.

## Dashboard

| Page | Description |
| --- | --- |
| **Overview** | System-wide stats — agents, jobs, CPU, RAM, memory pressure, recent audit logs |
| **Agents** | List and detail view of all agents with status, resource usage, skills, and permissions |
| **Jobs** | Task queue with filtering by status (queued, running, completed, failed) |
| **Models** | Local LLM catalog with hardware compatibility checks against your Mac's specs |
| **Network** | Domain allowlist management and pending connection requests from agents |
| **Policies** | Access control rules for file, credential, and network permissions per agent |
| **Credentials Vault** | Secure credential storage with masking (macOS Keychain integration planned) |
| **Access Requests** | Approval queue for agent requests to access files, credentials, or network |
| **Audit Logs** | Tamper-evident event log with hash chain verification |
| **System** | Mac hardware info, memory pressure, CPU load, process list, and login item settings |

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| Desktop | Electron 35, electron-builder |
| Charts | Recharts |
| Forms | react-hook-form, Zod |
| Testing | Vitest, Testing Library |
| Deployment | Firebase App Hosting |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm**

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Opens the Next.js dev server at `http://localhost:3000`.

### Build

```bash
pnpm build
```

## Electron

Run as a native macOS app:

```bash
# Development (build + launch)
pnpm electron:dev

# Production build (DMG + PKG for Apple Silicon)
pnpm electron:build
```

Target: macOS / Apple Silicon (arm64)

## Deployment

The web version deploys to Firebase App Hosting. Configuration files:

- `firebase.json` — App Hosting backend config
- `apphosting.yaml` — Runtime settings (min instances, env vars)
- `.firebaserc` — Project alias (`open-neo`)

## i18n

Supported languages:

| Code | Language |
| --- | --- |
| `en` | English |
| `ja` | Japanese (default) |
| `zh-CN` | Simplified Chinese |
| `zh-TW` | Traditional Chinese |

Translation files live in `lib/i18n/locales/`. The `useTranslation()` hook provides a `t()` function for dot-notation key lookup. Language preference is persisted to localStorage.

## Project Structure

```
app/                  # Next.js App Router pages
  dashboard/          # Dashboard routes (agents, jobs, models, etc.)
  download/           # Download page
  privacy/            # Privacy policy page
components/           # React components
  ui/                 # shadcn/ui component library
  policies/           # Policy-specific components
electron/             # Electron main process, preload, system info
hooks/                # Custom React hooks (battery, processes, system info)
lib/                  # Utilities, i18n, types, model catalog, mock data
  i18n/locales/       # Translation JSON files
docs/                 # Design specifications (requirements, architecture, tests)
public/               # Static assets and icons
tests/                # Test files
```

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| `dev` | `pnpm dev` | Start Next.js dev server |
| `build` | `pnpm build` | Production build |
| `start` | `pnpm start` | Start production server |
| `lint` | `pnpm lint` | Run ESLint |
| `test` | `pnpm test` | Run Vitest in watch mode |
| `test:run` | `pnpm test:run` | Run Vitest once |
| `electron:dev` | `pnpm electron:dev` | Build + launch Electron |
| `electron:build` | `pnpm electron:build` | Build macOS DMG/PKG |

## Branch Strategy

```
develop  →  release  →  main
(dev)       (staging)    (production)
```

### Tagging Convention

| Tag | Branch |
| --- | --- |
| `vX.Y.Z-develop` | develop |
| `vX.Y.Z-release` | release |
| `vX.Y.Z` | main |

### Release Flow

1. Feature/bugfix branch → PR merge into `develop` → tag `vX.Y.Z-develop`
2. `develop` → PR merge into `release` → tag `vX.Y.Z-release`
3. `release` → PR merge into `main` → tag `vX.Y.Z`

## License

TBD

---

# README.md（日本語）

**macOS 向けユーザー所有型エージェント OS**

ローカルファースト。透明性。信頼できるタスクマネージャーで 24 時間自律動作するエージェント。

## 概要

OpenNeo は、AI エージェントをマシン上で実行・監視・制御できる macOS デスクトップアプリケーションです。ローカルファーストアーキテクチャにより、データをデバイス上に保持しつつ、すべてのエージェントの動作（CPU、RAM、ネットワーク、ファイルアクセスなど）を完全に可視化します。

## 機能

- **エージェントタスクマネージャー** — エージェントごとの CPU / RAM / ネットワークをリアルタイム監視。macOS アクティビティモニタのような透明性。
- **ローカル LLM 優先** — OSS ローカルモデルを優先。推論は Mac 上で実行され、データはデバイスから出ません。
- **明示的クラウド承認** — Claude、GPT 等への外部 API 呼び出しはすべてユーザーの明示的承認が必要。
- **OKR 駆動エージェント** — エージェントごとに目標（OKR）を設定。スケジュール実行とハートビートで自律運用。
- **スキル＆自動化** — スキルの割り当てと自動生成。エージェントが能力を獲得しタスクを自動化。
- **プライバシー・バイ・デザイン** — デフォルトでデータ収集なし。すべてのアクセスはポリシー制御され監査ログに記録。

## ダッシュボード

| ページ | 説明 |
| --- | --- |
| **概要** | システム全体の統計 — エージェント数、ジョブ、CPU、RAM、メモリプレッシャー、最近の監査ログ |
| **エージェント** | 全エージェントの一覧・詳細ビュー（ステータス、リソース使用量、スキル、権限） |
| **ジョブ** | ステータス別フィルタリング付きタスクキュー（待機中、実行中、完了、失敗） |
| **モデル** | Mac スペックに対するハードウェア互換性チェック付きローカル LLM カタログ |
| **ネットワーク** | ドメイン許可リスト管理とエージェントからの接続リクエスト |
| **ポリシー** | エージェントごとのファイル・認証情報・ネットワーク権限のアクセス制御ルール |
| **認証情報 Vault** | マスキング付きセキュア認証情報ストレージ（macOS Keychain 統合予定） |
| **アクセスリクエスト** | ファイル・認証情報・ネットワークへのエージェントリクエスト承認キュー |
| **監査ログ** | ハッシュチェーン検証付き改ざん防止イベントログ |
| **システム** | Mac ハードウェア情報、メモリプレッシャー、CPU 負荷、プロセス一覧、ログイン項目設定 |

## 技術スタック

| カテゴリ | テクノロジー |
| --- | --- |
| フレームワーク | Next.js 16、React 19 |
| 言語 | TypeScript 5.7 |
| スタイリング | Tailwind CSS v4、shadcn/ui（Radix UI） |
| デスクトップ | Electron 35、electron-builder |
| チャート | Recharts |
| フォーム | react-hook-form、Zod |
| テスト | Vitest、Testing Library |
| デプロイ | Firebase App Hosting |

## はじめに

### 前提条件

- **Node.js** >= 18
- **pnpm**

### インストール

```bash
pnpm install
```

### 開発

```bash
pnpm dev
```

`http://localhost:3000` で Next.js 開発サーバーが起動します。

### ビルド

```bash
pnpm build
```

## Electron

ネイティブ macOS アプリとして実行：

```bash
# 開発（ビルド + 起動）
pnpm electron:dev

# プロダクションビルド（Apple Silicon 向け DMG + PKG）
pnpm electron:build
```

対象: macOS / Apple Silicon (arm64)

## デプロイ

Web 版は Firebase App Hosting にデプロイされます。設定ファイル：

- `firebase.json` — App Hosting バックエンド設定
- `apphosting.yaml` — ランタイム設定（最小インスタンス数、環境変数）
- `.firebaserc` — プロジェクトエイリアス（`open-neo`）

## i18n（多言語対応）

対応言語：

| コード | 言語 |
| --- | --- |
| `en` | 英語 |
| `ja` | 日本語（デフォルト） |
| `zh-CN` | 簡体字中国語 |
| `zh-TW` | 繁体字中国語 |

翻訳ファイルは `lib/i18n/locales/` に配置。`useTranslation()` フックがドット記法キーの `t()` 関数を提供します。言語設定は localStorage に保存されます。

## プロジェクト構成

```
app/                  # Next.js App Router ページ
  dashboard/          # ダッシュボードルート（agents, jobs, models 等）
  download/           # ダウンロードページ
  privacy/            # プライバシーポリシーページ
components/           # React コンポーネント
  ui/                 # shadcn/ui コンポーネントライブラリ
  policies/           # ポリシー関連コンポーネント
electron/             # Electron メインプロセス、プリロード、システム情報
hooks/                # カスタム React フック（バッテリー、プロセス、システム情報）
lib/                  # ユーティリティ、i18n、型定義、モデルカタログ、モックデータ
  i18n/locales/       # 翻訳 JSON ファイル
docs/                 # 設計仕様書（要件定義、アーキテクチャ、テスト）
public/               # 静的アセットとアイコン
tests/                # テストファイル
```

## スクリプト

| スクリプト | コマンド | 説明 |
| --- | --- | --- |
| `dev` | `pnpm dev` | Next.js 開発サーバー起動 |
| `build` | `pnpm build` | プロダクションビルド |
| `start` | `pnpm start` | プロダクションサーバー起動 |
| `lint` | `pnpm lint` | ESLint 実行 |
| `test` | `pnpm test` | Vitest ウォッチモード実行 |
| `test:run` | `pnpm test:run` | Vitest 単発実行 |
| `electron:dev` | `pnpm electron:dev` | ビルド + Electron 起動 |
| `electron:build` | `pnpm electron:build` | macOS DMG/PKG ビルド |

## ブランチ戦略

```
develop  →  release  →  main
(開発)       (ステージング)  (本番)
```

### タグ規則

| タグ | ブランチ |
| --- | --- |
| `vX.Y.Z-develop` | develop |
| `vX.Y.Z-release` | release |
| `vX.Y.Z` | main |

### リリースフロー

1. Feature/bugfix ブランチ → `develop` に PR マージ → `vX.Y.Z-develop` タグ
2. `develop` → `release` に PR マージ → `vX.Y.Z-release` タグ
3. `release` → `main` に PR マージ → `vX.Y.Z` タグ

## ライセンス

未定
