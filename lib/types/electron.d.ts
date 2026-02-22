// ─── System Information Types ───

export interface StaticSystemInfo {
  cpuModel: string
  chipGeneration: string
  gpuCores: number
  totalRAMBytes: number
  diskTotalBytes: number
  diskFreeBytes: number
  osVersion: string
  architecture: string
}

export interface DynamicSystemInfo {
  freeRAMBytes: number
  memoryPressure: 'nominal' | 'warning' | 'critical'
  cpuLoadPercent: number
  diskFreeBytes: number
  timestamp: string
}

export interface ProcessInfo {
  pid: number
  ppid: number
  cpuPercent: number
  ramBytes: number
  command: string
}

export interface BatteryInfo {
  percent: number
  charging: boolean
  timeRemaining: string
}

// ─── App Settings Types ───

export interface LoginItemSettings {
  openAtLogin: boolean
}

export interface KillProcessResult {
  success: boolean
  error?: string
}

// ─── ElectronAPI Interface ───

export interface ElectronAPI {
  platform: string

  // System info
  getStaticInfo: () => Promise<StaticSystemInfo>
  getDynamicInfo: () => Promise<DynamicSystemInfo>
  getProcesses: () => Promise<ProcessInfo[]>
  getBattery: () => Promise<BatteryInfo>

  // Process management
  killProcess: (pid: number) => Promise<KillProcessResult>

  // Polling
  startPolling: (intervalMs?: number) => void
  stopPolling: () => void
  onMetricsUpdate: (callback: (data: DynamicSystemInfo) => void) => () => void

  // Login items
  getLoginItemSettings: () => Promise<LoginItemSettings>
  setLoginItemSettings: (openAtLogin: boolean) => Promise<LoginItemSettings>
}

// ─── Global Window Extension ───

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
