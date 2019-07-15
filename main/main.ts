import * as path from 'path'
import { app, BrowserWindow, globalShortcut } from 'electron'
import { Menu, Notification } from 'electron'
import { ipcMain } from 'electron'
import * as Store from 'electron-store'

import ApplicationMenu from './application-menu'
import TrayMenu from './tray-menu'
import { defaultSettings } from './default-settings'
import { createNewWindow, getWindow } from './window'

import Alarm from '../classes/Alarm'
import { SettingsFields } from '../types/alarm'

import handleSquirrelEvent from './squirrel-event'
if (require('electron-squirrel-startup')) app.quit()
if (handleSquirrelEvent()) process.exit()


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

ipcMain.on('show-notification', (event: any, title: string, body: string) => {
  const notification = new Notification({title, body})
  notification.show()
})

ipcMain.on('activate', () => {
  const mainWindow = getWindow('main')
  if (mainWindow) mainWindow.show()
})


app.on('ready', () => {
  // @ts-ignore
  const settings: SettingsFields = store.get('settings')
  const trayMenu = new TrayMenu(settings.trayMonoIcon)
  trayMenu.setTrayMenu()

  ipcMain.on('icon-tray', (event: any) => {
    trayMenu.setDefaultIcon()
  })

  ipcMain.on('icon-tray-active', (event: any) => {
    trayMenu.setActiveIcon()
  })

  ipcMain.on('icons-tray-change', (event: any, trayMonoIcon: boolean) => {
    trayMenu.setIcons(trayMonoIcon)
    trayMenu.setDefaultIcon()
  })


  let mainWindow: BrowserWindow | null = null
  mainWindow = createNewWindow('main', {
    show: false, fullscreen: false,
  })

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
  }

  globalShortcut.register('Ctrl+Shift+I', function() {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.webContents.openDevTools()
  })
  globalShortcut.register('f5', function() {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.reload()
  })


  mainWindow.on('close', (event) => {
    // @ts-ignore
    if (app.quitting) {
      mainWindow = null
    } else {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // App quits when user presses Cmd+Q or selects quit from app menu, but not
  // when all windows are closed
  globalShortcut.register('Cmd+Q', function() {
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  const mainWindow = getWindow('main')
  if (mainWindow) mainWindow.show()
})

// @ts-ignore
app.on('before-quit', () => app.quitting = true)
