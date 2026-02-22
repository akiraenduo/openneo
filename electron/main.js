const { app, BrowserWindow, ipcMain, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const {
  getStaticSystemInfo,
  getDynamicSystemInfo,
  getProcessList,
  getBatteryInfo,
} = require('./system-info')

// Register the custom scheme before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
])

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

  mainWindow.loadURL('app://./')

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
  const outDir = path.join(__dirname, '..', 'out')

  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    let filePath = decodeURIComponent(url.pathname)

    // Resolve to absolute path inside out/
    let absPath = path.join(outDir, filePath)

    // If path is a directory, serve index.html inside it
    if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
      absPath = path.join(absPath, 'index.html')
    }

    // If file doesn't exist and has no extension, try .html
    if (!fs.existsSync(absPath) && !path.extname(absPath)) {
      absPath = absPath + '.html'
    }

    return net.fetch('file://' + absPath)
  })

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
