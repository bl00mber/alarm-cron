import { app, Menu, Tray } from 'electron'
import { getWindow } from './window'
import { isEqual, cloneDeep } from 'lodash'

let tray: Tray | null = null

export default class TrayMenu {
  defaultIcon: string;
  activeIcon: string;
  activeTemplate: object[];
  menu: Menu;

  constructor (trayMonoIcon: boolean) {
    this.setIcons(trayMonoIcon)
    this.setActiveTemplate(this.getMenuTemplate())
    tray = new Tray(this.defaultIcon)
  }

  setActiveTemplate (template: object[]) {
    if (!isEqual(template, this.activeTemplate)) {
      this.activeTemplate = template
      this.menu = Menu.buildFromTemplate(cloneDeep(template))
    }
  }

  getMenuTemplate () {
    return [
      {
        label: 'Open Alarm',
        click: () => {
          const mainWindow = getWindow('main')
          if (mainWindow) mainWindow.show()
        }
      },
      { type: 'separator' },
      {
        label: 'Reset all active',
        click: () => {
          const mainWindow = getWindow('main')
          if (mainWindow) mainWindow.webContents.send('reset-all-active-alarms')
        }
      },
      {
        label: 'Postpone all active',
        click: () => {
          const mainWindow = getWindow('main')
          if (mainWindow) mainWindow.webContents.send('postpone-all-active-alarms')
        }
      },
      { type: 'separator' },
      {
        label: 'Enable all disabled',
        click: () => {
          const mainWindow = getWindow('main')
          if (mainWindow) mainWindow.webContents.send('enable-all-disabled-alarms')
        }
      },
      {
        label: 'Pause all enabled',
        click: () => {
          const mainWindow = getWindow('main')
          if (mainWindow) mainWindow.webContents.send('pause-all-enabled-alarms')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]
  }

  setTrayMenu () {
    tray.setContextMenu(this.menu)
  }

  setIcons (trayMonoIcon: boolean) {
    if (trayMonoIcon) {
      this.defaultIcon = app.getAppPath()+'/resources/icon-tray-mono.png'
      this.activeIcon = app.getAppPath()+'/resources/icon-tray-active-mono.png'
    } else {
      this.defaultIcon = app.getAppPath()+'/resources/icon-tray.png'
      this.activeIcon = app.getAppPath()+'/resources/icon-tray-active.png'
    }
  }

  setDefaultIcon () {
    tray.setImage(this.defaultIcon)
  }

  setActiveIcon () {
    tray.setImage(this.activeIcon)
  }
}
