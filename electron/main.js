const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const {
  getStaticSystemInfo,
  getDynamicSystemInfo,
  getProcessList,
  getBatteryInfo,
} = require('./system-info')

let mainWindow = null
let pollingInterval = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'out', 'index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    stopPolling()
  })
}

// ─── IPC Handlers ───

// Static system info (invoke/handle - called once)
ipcMain.handle('system:get-static-info', () => {
  return getStaticSystemInfo()
})

// Dynamic system info (invoke/handle - on-demand)
ipcMain.handle('system:get-dynamic-info', () => {
  return getDynamicSystemInfo()
})

// Process list (invoke/handle)
ipcMain.handle('system:get-processes', () => {
  return getProcessList()
})

// Battery info (invoke/handle)
ipcMain.handle('system:get-battery', () => {
  return getBatteryInfo()
})

// Kill process by PID (invoke/handle)
ipcMain.handle('system:kill-process', (_event, pid) => {
  try {
    process.kill(pid, 'SIGTERM')
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// Login item settings
ipcMain.handle('app:get-login-item-settings', () => {
  const settings = app.getLoginItemSettings()
  return { openAtLogin: settings.openAtLogin }
})

ipcMain.handle('app:set-login-item-settings', (_event, openAtLogin) => {
  app.setLoginItemSettings({ openAtLogin })
  return { openAtLogin }
})

// ─── Polling (push-based metrics) ───

function startPolling(intervalMs = 3000) {
  stopPolling()
  pollingInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const data = getDynamicSystemInfo()
      mainWindow.webContents.send('system:metrics-update', data)
    }
  }, intervalMs)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

ipcMain.on('system:start-polling', (_event, intervalMs) => {
  startPolling(intervalMs || 3000)
})

ipcMain.on('system:stop-polling', () => {
  stopPolling()
})

// ─── App Lifecycle ───

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
