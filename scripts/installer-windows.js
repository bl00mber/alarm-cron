const electronInstaller = require('electron-winstaller')

installer = electronInstaller.createWindowsInstaller({
  appDirectory: './build/alarm-cron-win32-ia32',
  outputDirectory: './build/installers/win32',
  authors: 'Nick Reiley',
  setupExe: 'AlarmCronInstaller.exe',
  setupIcon: './resources/icon/icon.ico',
})

installer.then(() => console.log('Windows installer created'), (e) => console.log(`Error: ${e.message}`))
