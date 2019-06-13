import { shell } from 'electron'
import * as React from 'react'

import '../styles/About.scss'

export default class About extends React.Component {
  render () {
    return(
      <div className="about-container">
        <div>Copyright (c) Nick Reiley</div>
        <div>bloomber111@gmail.com</div>
        <a className="about-copyright" target="_blank"
          href="https://github.com/bl00mber/alarm-cron"
          onClick={e => {
            event.preventDefault()
            // @ts-ignore
            let url = e.target.href
            shell.openExternal(url)
        }}>alarm-cron</a>
      </div>
    )
  }
}
