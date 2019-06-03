import { BrowserWindow } from 'electron'
import * as Path from 'path'

const currentWindows: Map<number, BrowserWindow> = new Map()

export const createNewWindow = (options?: object): BrowserWindow => {
  const newWindow = new BrowserWindow({
    resizable: false,
    webPreferences: {nodeIntegration: true},
    ...(options ? options : {})
  })

  const windowId = newWindow.id

  newWindow.on('closed', function() {
    currentWindows.delete(windowId)
  })

  currentWindows.set(windowId, newWindow)
  return newWindow
}
