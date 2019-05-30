const { remote } = require('electron')
const { Menu, MenuItem } = remote

let rightClickPosition = null

const menu = new Menu()
menu.append(new MenuItem({ label: 'Inspect element', click() {
  remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y) }
}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {x: e.x, y: e.y}
  menu.popup({ window: remote.getCurrentWindow() })
}, false)
