import { app, BrowserWindow, globalShortcut } from 'electron'
import ApplicationMenu from './application-menu'
import { createNewWindow } from './window'
import * as path from 'path'

app.setName('Alarm')

const applicationMenu = new ApplicationMenu()
applicationMenu.setApplicationMenu()

app.on('ready', () => {
  let mainWindow: null | BrowserWindow = null

  if (process.env.NODE_ENV === "development") {
    mainWindow = createNewWindow({devTools: true, resizable: true})
  } else {
    mainWindow = createNewWindow()
  }

  if (process.env.NODE_ENV === "development") {
    function waitForWebpackDevServer() {
      const axios = require('axios')
      // @ts-ignore
      axios.get('http://localhost:8080/index.html').then(res => {
        // @ts-ignore
        process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
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
      mainWindow.webContents.openDevTools()
    })
    globalShortcut.register('f5', function() {
      mainWindow.reload()
  	})
  }
  else {
    mainWindow.loadURL('file://'+path.resolve(__dirname, '..', 'index.html'))
  }
})

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit()
  }
})
