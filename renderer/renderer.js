import React from 'react'
import { render } from 'react-dom'

import './style/style.scss'

class App extends React.Component {
  render() {
    return (
      <div>Alarm</div>
    )
  }
}

export default render(
  <App />,
  document.getElementById('root')
)
