import { app, Menu } from 'electron'
import { isEqual, cloneDeep } from 'lodash'
import { createNewWindow } from './window'

export default class ApplicationMenu {
  activeTemplate: object[];
  menu: Menu;

  constructor () {
    this.setActiveTemplate(this.getMenuTemplate())
  }

  setActiveTemplate (template: object[]) {
    if (!isEqual(template, this.activeTemplate)) {
      this.activeTemplate = template
      this.menu = Menu.buildFromTemplate(cloneDeep(template))
    }
  }

  setApplicationMenu () {
    Menu.setApplicationMenu(this.menu)
  }

  getMenuTemplate () {
    return [{
      label: app.getName(),
      submenu: [
        {
          label: 'Settings',
          click: () => createNewWindow('settings', {width: 500, height: 600})
        },
        {
          label: 'About',
          click: () => createNewWindow('about', {width: 300, height: 200})
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit()
        }
      ]
    }]
  }
}
