import * as React from 'react'
import { render } from 'react-dom'
import AlarmApp from './components/AlarmApp'

import './utils/prototype'
import './style/checkbox.css'

if (process.env.NODE_ENV !== 'production') {
  require('./utils/inspectElement')
}

render(
  <AlarmApp />,
  document.getElementById('root')
)
