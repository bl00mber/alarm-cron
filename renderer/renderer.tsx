import * as React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'
import AlarmApp from './components/AlarmApp'
import Settings from './components/Settings'
import About from './components/About'

import './utils/prototype'
import './styles/checkbox.css'

if (process.env.NODE_ENV !== 'production') {
  require('./utils/inspectElement')

  const { warn } = console
  // @ts-ignore
  console.warn = (...args) => {
    /^%cElectron Security Warning/.test(args[0])
      || Reflect.apply(warn, console, args)
  }
}

render(
  <HashRouter>
    <Route path="/" exact component={AlarmApp} />
    <Route path="/settings" component={Settings} />
    <Route path="/about" component={About} />
  </HashRouter>,
  document.getElementById('root')
)
