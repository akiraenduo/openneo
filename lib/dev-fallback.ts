import type { StaticSystemInfo, DynamicSystemInfo, ProcessInfo, BatteryInfo } from '@/lib/types/electron'

const GB = 1024 ** 3
const MB = 1024 ** 2

export const DEV_STATIC_INFO: StaticSystemInfo = {
  cpuModel: 'Apple M3 Pro',
  chipGeneration: 'M3 Pro',
  gpuCores: 18,
  totalRAMBytes: 36 * GB,
  diskTotalBytes: 500 * GB,
  diskFreeBytes: 280 * GB,
  osVersion: '15.3',
  architecture: 'arm64',
}

export const DEV_DYNAMIC_INFO: DynamicSystemInfo = {
  freeRAMBytes: 18.4 * GB,
  memoryPressure: 'nominal',
  cpuLoadPercent: 12.5,
  diskFreeBytes: 280 * GB,
  timestamp: '2026-01-01T00:00:00.000Z',
}

export const DEV_PROCESSES: ProcessInfo[] = [
  { pid: 1, ppid: 0, cpuPercent: 0.1, ramBytes: 50 * MB, command: '/sbin/launchd' },
  { pid: 100, ppid: 1, cpuPercent: 5.2, ramBytes: 200 * MB, command: '/Applications/Safari.app/Contents/MacOS/Safari' },
  { pid: 200, ppid: 1, cpuPercent: 12.0, ramBytes: 800 * MB, command: 'node' },
]

export const DEV_BATTERY: BatteryInfo = {
  percent: 85,
  charging: false,
  timeRemaining: '4:30',
}
