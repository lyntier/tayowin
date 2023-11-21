import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import { api } from '../shared/ipc/channels'

process.env.ROOT = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, 'public')
  : path.join(process.env.ROOT, '.output/public')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let win: BrowserWindow
const preload = path.join(process.env.DIST, 'preload.js')

function insertIpcMainHandlers() {
  Object.keys(api).forEach((key) => {
    ipcMain.handle(key, api[key.toString()])
  })
}

function bootstrap() {
  insertIpcMainHandlers()

  // Window
  win = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  // Get proper URL
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'))
  }
}
app.whenReady().then(bootstrap)
