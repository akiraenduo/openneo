// ─── TypeScript interfaces ───

export interface Agent {
  id: string
  name: string
  status: 'running' | 'idle' | 'blocked'
  okr: string
  cpuPercent: number
  ramMB: number
  network: 'local' | 'approved' | 'blocked'
  lastAction: string
  skills: string[]
  permissions: string[]
  recentActions: { time: string; action: string }[]
  openAtLogin: boolean
}

export interface FileAccessRule {
  id: string
  mode: 'allowlist' | 'denylist'
  allowedPaths: string[]
  deniedPaths: string[]
  recursive: boolean
  read: boolean
  write: boolean
  delete: boolean
}

export interface CredentialRule {
  id: string
  mode: 'onlyRegistered' | 'allowNone' | 'allowAny'
  allowedCredentialIds: string[]
  requireApprovalForUse: boolean
}

export interface NetworkRule {
  id: string
  mode: 'allowlist' | 'blockAll' | 'allowAll'
  domains: string[]
  requireApproval: boolean
}

export interface Policy {
  id: string
  name: string
  scope: 'global' | 'agent'
  agentId?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  rules: FileAccessRule[]
  credentialRules: CredentialRule[]
  networkRules: NetworkRule[]
}

export interface Credential {
  id: string
  label: string
  username: string
  secretMasked: string
  createdAt: string
  lastUsedAt?: string
  tags: string[]
}

export interface AccessRequest {
  id: string
  type: 'file' | 'network' | 'credential'
  agentId: string
  resource: string
  action: string
  status: 'pending' | 'approved' | 'denied'
  requestedAt: string
  decisionAt?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  eventType: string
  actor: string
  target: string
  details: string
  hashChainIndicator: string
}

export interface Job {
  id: string
  agentId: string
  agentName: string
  title: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  createdAt: string
}

export interface LLMModel {
  id: string
  family: string
  name: string
  size: string
  quant: string
  estimatedRAM: string
  diskSize: string
  suitability: 'ok' | 'heavy' | 'not-recommended'
}

export interface NetworkDomain {
  id: string
  domain: string
  approved: boolean
  addedAt: string
}

// ─── Default data ───

export const defaultAgents: Agent[] = [
  {
    id: 'agent-1', name: 'Marketing', status: 'running',
    okr: 'Q1 コンテンツ作成 (80%)', cpuPercent: 12.4, ramMB: 340,
    network: 'approved', lastAction: 'レポート生成中',
    skills: ['テキスト生成', 'CSV解析', 'メール送信'],
    permissions: ['ファイル読み取り', 'ネットワーク (承認済み)'],
    recentActions: [
      { time: '14:32', action: 'レポート生成を開始' },
      { time: '14:30', action: 'CSVデータを読み込み' },
      { time: '14:28', action: 'OKR進捗を更新' },
      { time: '14:15', action: 'メールテンプレートを作成' },
    ],
    openAtLogin: true,
  },
  {
    id: 'agent-2', name: 'Sales', status: 'idle',
    okr: 'Q1 リード管理 (45%)', cpuPercent: 0.2, ramMB: 120,
    network: 'local', lastAction: 'スケジュール待機中',
    skills: ['CRM連携', 'データ分析', 'レポート作成'],
    permissions: ['ファイル読み取り', 'ファイル書き込み'],
    recentActions: [
      { time: '13:45', action: 'リードデータを更新' },
      { time: '13:30', action: 'レポートを保存' },
      { time: '12:00', action: 'スケジュール実行完了' },
    ],
    openAtLogin: false,
  },
  {
    id: 'agent-3', name: 'Research', status: 'blocked',
    okr: '論文調査 (20%)', cpuPercent: 0, ramMB: 85,
    network: 'blocked', lastAction: 'ネットワーク承認待ち',
    skills: ['Web検索', 'テキスト要約', 'PDF解析'],
    permissions: ['ファイル読み取り'],
    recentActions: [
      { time: '14:35', action: 'api.example.com へのリクエストがブロック' },
      { time: '14:30', action: 'ネットワーク承認をリクエスト' },
      { time: '14:00', action: 'ローカルファイルの分析完了' },
    ],
    openAtLogin: true,
  },
  {
    id: 'agent-4', name: 'DevOps', status: 'running',
    okr: 'インフラ監視 (90%)', cpuPercent: 8.1, ramMB: 256,
    network: 'approved', lastAction: 'ログ解析実行中',
    skills: ['ログ解析', 'アラート管理', 'デプロイ確認'],
    permissions: ['ファイル読み取り', 'ファイル書き込み', 'ネットワーク (承認済み)'],
    recentActions: [
      { time: '14:40', action: 'ログファイルを解析中' },
      { time: '14:35', action: 'アラート閾値を確認' },
      { time: '14:20', action: 'デプロイ状態を確認' },
    ],
    openAtLogin: true,
  },
]

export const defaultJobs: Job[] = [
  { id: 'job-1', agentId: 'agent-1', agentName: 'Marketing', title: 'Q1レポート生成', status: 'running', progress: 65, createdAt: '2026-02-22T14:30:00Z' },
  { id: 'job-2', agentId: 'agent-2', agentName: 'Sales', title: 'リードCSVインポート', status: 'queued', progress: 0, createdAt: '2026-02-22T14:25:00Z' },
  { id: 'job-3', agentId: 'agent-4', agentName: 'DevOps', title: 'ログ解析バッチ', status: 'running', progress: 40, createdAt: '2026-02-22T14:20:00Z' },
  { id: 'job-4', agentId: 'agent-1', agentName: 'Marketing', title: 'メール配信準備', status: 'completed', progress: 100, createdAt: '2026-02-22T13:00:00Z' },
  { id: 'job-5', agentId: 'agent-3', agentName: 'Research', title: 'Web記事収集', status: 'failed', progress: 15, createdAt: '2026-02-22T14:35:00Z' },
]

export const defaultModels: LLMModel[] = [
  { id: 'model-1', family: 'Llama', name: 'Llama 3.3 70B', size: '70B', quant: 'Q4_K_M', estimatedRAM: '42 GB', diskSize: '38 GB', suitability: 'heavy' },
  { id: 'model-2', family: 'Llama', name: 'Llama 3.2 8B', size: '8B', quant: 'Q4_K_M', estimatedRAM: '6 GB', diskSize: '4.9 GB', suitability: 'ok' },
  { id: 'model-3', family: 'Mistral', name: 'Mistral 7B', size: '7B', quant: 'Q5_K_M', estimatedRAM: '5.5 GB', diskSize: '5.1 GB', suitability: 'ok' },
  { id: 'model-4', family: 'Phi', name: 'Phi-3 Mini', size: '3.8B', quant: 'Q4_K_M', estimatedRAM: '3 GB', diskSize: '2.3 GB', suitability: 'ok' },
  { id: 'model-5', family: 'Gemma', name: 'Gemma 2 27B', size: '27B', quant: 'Q4_K_M', estimatedRAM: '18 GB', diskSize: '16 GB', suitability: 'heavy' },
  { id: 'model-6', family: 'Llama', name: 'Llama 3.1 405B', size: '405B', quant: 'Q2_K', estimatedRAM: '180 GB', diskSize: '160 GB', suitability: 'not-recommended' },
]

export const defaultNetworkDomains: NetworkDomain[] = [
  { id: 'nd-1', domain: 'api.openai.com', approved: true, addedAt: '2026-02-20' },
  { id: 'nd-2', domain: 'api.anthropic.com', approved: true, addedAt: '2026-02-20' },
  { id: 'nd-3', domain: 'huggingface.co', approved: true, addedAt: '2026-02-21' },
  { id: 'nd-4', domain: 'api.example.com', approved: false, addedAt: '2026-02-22' },
]

export const defaultCredentials: Credential[] = [
  {
    id: 'cred-1',
    label: 'Gmail-SMTP',
    username: 'team@openxxx.io',
    secretMasked: '••••••••••••',
    createdAt: '2025-12-01T09:00:00Z',
    lastUsedAt: '2026-02-20T14:30:00Z',
    tags: ['email', 'smtp'],
  },
  {
    id: 'cred-2',
    label: 'AWS-S3-Key',
    username: 'AKIA...7X3Q',
    secretMasked: '••••••••••••',
    createdAt: '2025-11-15T10:00:00Z',
    lastUsedAt: '2026-02-18T08:00:00Z',
    tags: ['aws', 'storage'],
  },
  {
    id: 'cred-3',
    label: 'Slack-Bot-Token',
    username: 'xoxb-openxxx-bot',
    secretMasked: '••••••••••••',
    createdAt: '2026-01-10T12:00:00Z',
    tags: ['slack', 'bot'],
  },
]

export const defaultPolicies: Policy[] = [
  {
    id: 'policy-1',
    name: 'グローバルセキュリティポリシー',
    scope: 'global',
    enabled: true,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    rules: [
      {
        id: 'fr-1',
        mode: 'allowlist',
        allowedPaths: ['/Users/akira/Projects', '/Users/akira/Documents/OpenXXX'],
        deniedPaths: [],
        recursive: true,
        read: true,
        write: true,
        delete: false,
      },
    ],
    credentialRules: [
      {
        id: 'cr-1',
        mode: 'onlyRegistered',
        allowedCredentialIds: ['cred-1', 'cred-2', 'cred-3'],
        requireApprovalForUse: true,
      },
    ],
    networkRules: [
      {
        id: 'nr-1',
        mode: 'allowlist',
        domains: ['api.openai.com', 'api.slack.com', 'smtp.gmail.com'],
        requireApproval: true,
      },
    ],
  },
  {
    id: 'policy-2',
    name: 'Marketing エージェント制限',
    scope: 'agent',
    agentId: 'agent-1',
    enabled: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
    rules: [
      {
        id: 'fr-2',
        mode: 'allowlist',
        allowedPaths: ['/Users/akira/Projects/marketing'],
        deniedPaths: [],
        recursive: true,
        read: true,
        write: true,
        delete: false,
      },
    ],
    credentialRules: [
      {
        id: 'cr-2',
        mode: 'onlyRegistered',
        allowedCredentialIds: ['cred-1'],
        requireApprovalForUse: false,
      },
    ],
    networkRules: [
      {
        id: 'nr-2',
        mode: 'allowlist',
        domains: ['api.slack.com', 'smtp.gmail.com'],
        requireApproval: false,
      },
    ],
  },
]

export const defaultAccessRequests: AccessRequest[] = [
  {
    id: 'req-1',
    type: 'file',
    agentId: 'agent-1',
    resource: '/Users/akira/Desktop/report-2026Q1.csv',
    action: 'read',
    status: 'pending',
    requestedAt: '2026-02-22T09:15:00Z',
  },
  {
    id: 'req-2',
    type: 'credential',
    agentId: 'agent-2',
    resource: 'Gmail-SMTP',
    action: 'use',
    status: 'pending',
    requestedAt: '2026-02-22T09:20:00Z',
  },
  {
    id: 'req-3',
    type: 'network',
    agentId: 'agent-3',
    resource: 'api.example.com',
    action: 'https-request',
    status: 'pending',
    requestedAt: '2026-02-22T09:30:00Z',
  },
  {
    id: 'req-4',
    type: 'file',
    agentId: 'agent-3',
    resource: '/Users/akira/Documents/secrets/api-keys.txt',
    action: 'read',
    status: 'denied',
    requestedAt: '2026-02-21T14:00:00Z',
    decisionAt: '2026-02-21T14:05:00Z',
  },
  {
    id: 'req-5',
    type: 'network',
    agentId: 'agent-1',
    resource: 'malware-site.ru',
    action: 'https-request',
    status: 'denied',
    requestedAt: '2026-02-20T11:00:00Z',
    decisionAt: '2026-02-20T11:01:00Z',
  },
]

export const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-02-22T14:35:00Z',
    eventType: 'ACCESS_DENIED',
    actor: 'system',
    target: 'agent-3 (Research)',
    details: 'api.example.com へのネットワーク接続をブロック',
    hashChainIndicator: 'sha256:a1b2c3...f4e5d6',
  },
  {
    id: 'log-2',
    timestamp: '2026-02-22T14:30:00Z',
    eventType: 'AGENT_ACTION',
    actor: 'agent-1 (Marketing)',
    target: 'レポート',
    details: 'Q1レポート生成を開始',
    hashChainIndicator: 'sha256:d7e8f9...a0b1c2',
  },
  {
    id: 'log-3',
    timestamp: '2026-02-21T14:05:00Z',
    eventType: 'ACCESS_DENIED',
    actor: 'system',
    target: 'req-4',
    details: 'Research エージェントの /Users/akira/Documents/secrets/api-keys.txt へのアクセスを拒否',
    hashChainIndicator: 'sha256:e9f0a1...b2c3d4',
  },
  {
    id: 'log-4',
    timestamp: '2026-02-15T10:00:00Z',
    eventType: 'POLICY_UPDATED',
    actor: 'user',
    target: 'policy-1',
    details: 'グローバルセキュリティポリシーを更新',
    hashChainIndicator: 'sha256:c3d4e5...f6a7b8',
  },
  {
    id: 'log-5',
    timestamp: '2026-02-10T08:00:00Z',
    eventType: 'POLICY_CREATED',
    actor: 'user',
    target: 'policy-2',
    details: 'Marketing エージェント制限ポリシーを作成',
    hashChainIndicator: 'sha256:f5g6h7...i8j9k0',
  },
  {
    id: 'log-6',
    timestamp: '2025-12-01T09:00:00Z',
    eventType: 'CREDENTIAL_CREATED',
    actor: 'user',
    target: 'cred-1',
    details: 'Gmail-SMTP クレデンシャルを登録',
    hashChainIndicator: 'sha256:l1m2n3...o4p5q6',
  },
]

// ─── localStorage helpers ───

const STORAGE_KEYS = {
  policies: 'openxxx_policies',
  credentials: 'openxxx_credentials',
  accessRequests: 'openxxx_access_requests',
  auditLogs: 'openxxx_audit_logs',
  readOnlyMode: 'openxxx_read_only_mode',
} as const

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return fallback
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

export function loadPolicies(): Policy[] {
  return getFromStorage(STORAGE_KEYS.policies, defaultPolicies)
}
export function savePolicies(p: Policy[]): void {
  setToStorage(STORAGE_KEYS.policies, p)
}
export function loadCredentials(): Credential[] {
  return getFromStorage(STORAGE_KEYS.credentials, defaultCredentials)
}
export function saveCredentials(c: Credential[]): void {
  setToStorage(STORAGE_KEYS.credentials, c)
}
export function loadAccessRequests(): AccessRequest[] {
  return getFromStorage(STORAGE_KEYS.accessRequests, defaultAccessRequests)
}
export function saveAccessRequests(r: AccessRequest[]): void {
  setToStorage(STORAGE_KEYS.accessRequests, r)
}
export function loadAuditLogs(): AuditLogEntry[] {
  return getFromStorage(STORAGE_KEYS.auditLogs, defaultAuditLogs)
}
export function saveAuditLogs(l: AuditLogEntry[]): void {
  setToStorage(STORAGE_KEYS.auditLogs, l)
}
export function loadReadOnlyMode(): boolean {
  return getFromStorage(STORAGE_KEYS.readOnlyMode, false)
}
export function saveReadOnlyMode(m: boolean): void {
  setToStorage(STORAGE_KEYS.readOnlyMode, m)
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateHash(): string {
  const c = 'abcdef0123456789'
  let h = 'sha256:'
  for (let i = 0; i < 6; i++) h += c[Math.floor(Math.random() * c.length)]
  return h + '...'
}
