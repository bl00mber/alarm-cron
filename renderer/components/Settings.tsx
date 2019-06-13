import { ipcRenderer } from 'electron'
import * as Store from 'electron-store'

import * as React from 'react'
import { SettingsFields, Week } from '../../types/alarm'

import '../styles/Settings.scss'

interface State {
  store: Store,
  settings: SettingsFields,
}

export default class Settings extends React.Component<any, State> {
  constructor (props: object) {
    super(props)

    const store = new Store()

    this.state = {
      store,
      // @ts-ignore
      settings: store.get('settings'),
    }

    ipcRenderer.on('res-settings', this.updateStateSettings)
  }

  updateStateSettings = (event: any, settings: SettingsFields) => {
    this.setState({ settings })
  }

  syncSettings = () => {
    const { store, settings } = this.state
    ipcRenderer.send('sync-settings', settings)
  }

  restoreDefaultSettings () {
    ipcRenderer.send('restore-default-settings')
  }

  render () {
    const { settings } = this.state
    return(
      <div>
        {settings && <div>
        </div>}
      </div>
    )
  }
}
