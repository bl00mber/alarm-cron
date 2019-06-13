import * as path from 'path'
import { app, BrowserWindow, globalShortcut } from 'electron'
import { ipcMain } from 'electron'
import * as Store from 'electron-store'

import ApplicationMenu from './application-menu'
import { createNewWindow, getWindow } from './window'
import { defaultSettings } from './default-settings'
import Alarm from '../classes/Alarm'
import { SettingsFields } from '../types/alarm'


app.setName('Alarm')

const applicationMenu = new ApplicationMenu()
applicationMenu.setApplicationMenu()


const store = new Store()

function initSettings() {
  const settings = store.get('settings')
  if (!settings) store.set('settings', defaultSettings)
}
initSettings()

ipcMain.on('save-settings', (event: any, settings: SettingsFields) => {
  store.set('settings', settings)
  const mainWindow = getWindow('main')
  if (mainWindow) mainWindow.webContents.send('res-settings', settings)
})

ipcMain.on('restore-default-settings', (event: any) => {
  store.set('settings', defaultSettings)
  const mainWindow = getWindow('main')
  if (mainWindow) mainWindow.webContents.send('res-settings', defaultSettings)
  const settings = getWindow('settings')
  if (settings) settings.webContents.send('res-settings', defaultSettings)
})


app.on('ready', () => {
  let mainWindow: BrowserWindow | null = null

  if (process.env.NODE_ENV === 'production') {
    mainWindow = createNewWindow('main')
  } else {
    mainWindow = createNewWindow('main', {devTools: true, resizable: true})
  }

  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadURL('file://'+path.resolve(__dirname, '..', 'index.html'))
  } else {
    function waitForWebpackDevServer() {
      const axios = require('axios')
      // @ts-ignore
      axios.get('http://localhost:8080/index.html').then(res => {
        mainWindow.loadURL('http://localhost:8080/index.html')
        // @ts-ignore
        mainWindow.openDevTools()
      // @ts-ignore
      }).catch(err => {
        setTimeout(waitForWebpackDevServer, 200)
      })
    }
    waitForWebpackDevServer()

    globalShortcut.register('Ctrl+Shift+I', function() {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) focusedWindow.webContents.openDevTools()
    })
    globalShortcut.register('f5', function() {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) focusedWindow.reload()
  	})
  }

  // App quits when user presses Cmd+Q or selects quit from app menu, but not
  // when all windows are closed
  globalShortcut.register('Cmd+Q', function() {
    app.quit()
  })
})
