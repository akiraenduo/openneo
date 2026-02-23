const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs')
const {
  getStaticSystemInfo,
  getDynamicSystemInfo,
  getProcessList,
  getBatteryInfo,
} = require('./system-info')

const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.webp':  'image/webp',
  '.txt':   'text/plain',
  '.xml':   'application/xml',
}

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

  mainWindow.loadURL('app://./dashboard/')

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
    let absPath = path.join(outDir, filePath)

    if (fs.existsSync(absPath) && fs.statSync(absPath).isDirectory()) {
      absPath = path.join(absPath, 'index.html')
    }

    if (!fs.existsSync(absPath) && !path.extname(absPath)) {
      absPath = absPath + '.html'
    }

    if (!fs.existsSync(absPath)) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    const data = fs.readFileSync(absPath)
    const ext = path.extname(absPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': mimeType },
    })
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
