import '@testing-library/jest-dom'
import type { ElectronAPI } from '@/lib/types/electron'

const GB = 1024 * 1024 * 1024

// Default mock: 36GB M3 Pro with ~18GB free
const mockElectronAPI: ElectronAPI = {
  platform: 'darwin',

  getStaticInfo: async () => ({
    cpuModel: 'Apple M3 Pro',
    chipGeneration: 'Apple M3 Pro',
    gpuCores: 18,
    totalRAMBytes: 36 * GB,
    diskTotalBytes: 1000 * GB,
    diskFreeBytes: 500 * GB,
    osVersion: '14.4',
    architecture: 'arm64',
  }),

  getDynamicInfo: async () => ({
    freeRAMBytes: 18.4 * GB,
    memoryPressure: 'nominal' as const,
    cpuLoadPercent: 12.5,
    diskFreeBytes: 500 * GB,
    timestamp: new Date().toISOString(),
  }),

  getProcesses: async () => [
    { pid: 1, ppid: 0, cpuPercent: 0.1, ramBytes: 50 * 1024 * 1024, command: '/sbin/launchd' },
    { pid: 100, ppid: 1, cpuPercent: 5.2, ramBytes: 200 * 1024 * 1024, command: '/Applications/Safari.app/Contents/MacOS/Safari' },
    { pid: 200, ppid: 1, cpuPercent: 12.0, ramBytes: 800 * 1024 * 1024, command: 'node' },
  ],

  getBattery: async () => ({
    percent: 85,
    charging: false,
    timeRemaining: '4:30',
  }),

  killProcess: async (pid: number) => {
    if (pid === 1) return { success: false, error: 'Operation not permitted' }
    if (pid > 0) return { success: true }
    return { success: false, error: 'Invalid PID' }
  },

  startPolling: () => {},
  stopPolling: () => {},
  onMetricsUpdate: () => () => {},

  getLoginItemSettings: async () => ({ openAtLogin: false }),
  setLoginItemSettings: async (openAtLogin: boolean) => ({ openAtLogin }),
}

// Install mock on global window
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
})
