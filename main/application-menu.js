const { app, Menu } = require('electron')
const _ = require('underscore-plus')

module.exports =
class ApplicationMenu {
  constructor() {
    this.setActiveTemplate(this.getMenuTemplate())
  }

  setActiveTemplate (template) {
    if (!_.isEqual(template, this.activeTemplate)) {
      this.activeTemplate = template
      this.menu = Menu.buildFromTemplate(_.deepClone(template))
    }
  }

  setApplicationMenu () {
    Menu.setApplicationMenu(this.menu)
  }

  getMenuTemplate() {
    return [{
      label: app.getName(),
      submenu: [
        {
          label: 'Settings',
        },
        {
          label: 'About'
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
