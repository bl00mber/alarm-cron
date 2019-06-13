import { remote } from 'electron'
const { Menu, MenuItem } = remote

let rightClickPosition: object | null = null

const menu = new Menu()
menu.append(new MenuItem({ label: 'Inspect element', click() {
  // @ts-ignore
  remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
}}))

window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  rightClickPosition = {x: e.x, y: e.y}
  menu.popup({ window: remote.getCurrentWindow() })
}, false)
