const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // Static system info (one-time fetch)
  getStaticInfo: () => ipcRenderer.invoke('system:get-static-info'),

  // Dynamic system info (on-demand)
  getDynamicInfo: () => ipcRenderer.invoke('system:get-dynamic-info'),

  // Process list
  getProcesses: () => ipcRenderer.invoke('system:get-processes'),

  // Battery info
  getBattery: () => ipcRenderer.invoke('system:get-battery'),

  // Kill process by PID
  killProcess: (pid) => ipcRenderer.invoke('system:kill-process', pid),

  // Polling control
  startPolling: (intervalMs) => ipcRenderer.send('system:start-polling', intervalMs),
  stopPolling: () => ipcRenderer.send('system:stop-polling'),

  // Metrics push subscription (returns cleanup function)
  onMetricsUpdate: (callback) => {
    const handler = (_event, data) => callback(data)
    ipcRenderer.on('system:metrics-update', handler)
    return () => {
      ipcRenderer.removeListener('system:metrics-update', handler)
    }
  },

  // Login item settings
  getLoginItemSettings: () => ipcRenderer.invoke('app:get-login-item-settings'),
  setLoginItemSettings: (openAtLogin) => ipcRenderer.invoke('app:set-login-item-settings', openAtLogin),
})
