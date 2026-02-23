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

// ─── Utility functions ───

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateHash(): string {
  const c = 'abcdef0123456789'
  let h = 'sha256:'
  for (let i = 0; i < 6; i++) h += c[Math.floor(Math.random() * c.length)]
  return h + '...'
}
