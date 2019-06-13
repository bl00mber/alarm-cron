import { BrowserWindow } from 'electron'
import * as path from 'path'

const currentWindows: Map<string, BrowserWindow> = new Map()

export const createNewWindow = (windowId: string, options: object = {}): BrowserWindow | null => {
  if (currentWindows.has(windowId)) return null

  if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    options.resizable = true
  }

  const newWindow = new BrowserWindow({
    resizable: false,
    webPreferences: {nodeIntegration: true},
    ...options
  })

  newWindow.on('closed', function() {
    currentWindows.delete(windowId)
  })

  if (windowId !== 'main') {
    if (process.env.NODE_ENV === 'production') {
      const indexUrl = 'file://'+path.resolve(__dirname, '..', 'index.html')
      newWindow.loadURL(`indexUrl#/${windowId}`)
    } else {
      newWindow.loadURL('http://localhost:8080/index.html#/'+windowId)
    }
  }

  currentWindows.set(windowId, newWindow)
  return newWindow
}
