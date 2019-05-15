const path = require('path')
const { app, BrowserWindow } = require('electron')
const ApplicationMenu = require('./application-menu')

app.setName('Alarm')

let mainWindow

const applicationMenu = new ApplicationMenu()
applicationMenu.setApplicationMenu()

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // if (process.env.npm_package_scripts_main.slice(9,20) === "development") {
  //   function waitForWebpackDevServer() {
  //     const axios = require('axios')
  //     axios.get('http://localhost:8080/index.html').then(res => {
  //
  //       process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
  //       mainWindow.loadURL('http://localhost:8080/index.html')
  //       mainWindow.openDevTools()
  //
  //     }).catch(err => {
  //       setTimeout(waitForWebpackDevServer(), 200)
  //     })
  //   }
  //   waitForWebpackDevServer()
  // }
  // else {
  //   mainWindow.loadURL('file://'+path.resolve(__dirname, '..', 'index.html'))
  // }

  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
})

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit()
  }
})
