import { shell } from 'electron'
import * as React from 'react'

import '../styles/About.scss'

export default class About extends React.Component {
  state = {
    iconCopyright: false,
  }
  openWebPage (e) {
    event.preventDefault()
    // @ts-ignore
    let url = e.target.href
    shell.openExternal(url)
  }
  render () {
    const { iconCopyright } = this.state
    return(
      <div className="about-container">
        <a href="https://www.paypal.me/bloomber/30" target="_blank" onClick={this.openWebPage}>
          <img src="https://img.shields.io/badge/Donate-PayPal-green.svg" alt="Donate" style={{pointerEvents: 'none', marginBottom: '5px'}} /></a>

        <div>Copyright (c) Nick Reiley</div>
        <div>bloomber111@gmail.com</div>
        <a className="about-copyright" target="_blank"
          href="https://github.com/bl00mber/alarm-cron"
          onClick={this.openWebPage}>alarm-cron</a>

        <div className="toggle-icon-copyright" onClick={() => this.setState({ iconCopyright: !iconCopyright })}>icon copyright</div>

        {iconCopyright &&
        <div className="">
          <p>Icons made by <a href="https://www.flaticon.com/authors/daniele-de-santis" onClick={this.openWebPage} title="Daniele De Santis">Daniele De Santis</a>, <a href="https://www.flaticon.com/authors/smashicons" onClick={this.openWebPage} title="Smashicons">Smashicons</a>, <a href="https://www.freepik.com/" onClick={this.openWebPage} title="Freepik">Freepik</a>, <a href="https://www.flaticon.com/authors/hanan" onClick={this.openWebPage} title="Hanan">Hanan</a> from <a href="https://www.flaticon.com/" onClick={this.openWebPage} title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" onClick={this.openWebPage} title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>
        </div>}
      </div>
    )
  }
}
