import { app, Menu } from 'electron'
// @ts-ignore
import * as _ from 'underscore-plus'
import { createNewWindow } from './window'

export default class ApplicationMenu {
  activeTemplate: object[];
  menu: Menu;

  constructor () {
    this.setActiveTemplate(this.getMenuTemplate())
  }

  setActiveTemplate (template: object[]) {
    if (!_.isEqual(template, this.activeTemplate)) {
      this.activeTemplate = template
      this.menu = Menu.buildFromTemplate(_.deepClone(template))
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
          click: () => createNewWindow({width: 800, height: 600})
        },
        {
          label: 'About',
          click: () => createNewWindow({width: 800, height: 600})
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
