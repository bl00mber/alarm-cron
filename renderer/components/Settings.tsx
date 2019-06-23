/*
Copyright (c) Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import { ipcRenderer } from 'electron'
import * as Store from 'electron-store'

import * as React from 'react'
import { cloneDeep, capitalize } from 'lodash'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import { SettingsFields, Week, RepeatType } from '../../types/alarm'

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

  saveSettings = () => {
    ipcRenderer.send('save-settings', this.state.settings)
    setTimeout(() => ipcRenderer.send('icons-tray-change', this.state.settings.trayMonoIcon), 1000)
  }

  restoreDefaultSettings () {
    ipcRenderer.send('restore-default-settings')
  }

  updateSettingsKey = (key: string, value: any) => {
    const settings = cloneDeep(this.state.settings)
    settings[key] = value
    this.setState({ settings })
  }

  updateRepeatType = (toggleCountdown?: boolean) => {
    const { repeatType, repeatDaysOfWeek } = this.state.settings
    let newRepeatType: RepeatType
    let weekDayIsToggled = false
    for (let key in repeatDaysOfWeek) {
      if (repeatDaysOfWeek[key] === true) {
        weekDayIsToggled = true
        break
      }
    }
    if (toggleCountdown) {
      if (repeatType === 'once' || repeatType === 'weekly') {
        newRepeatType = 'countdown'
      } else {
        if (weekDayIsToggled) { newRepeatType = 'weekly' }
        else { newRepeatType = 'once' }
      }
    } else {
      if (weekDayIsToggled) { newRepeatType = 'weekly' }
      else { newRepeatType = 'once' }
    }
    const settings = cloneDeep(this.state.settings)
    settings.repeatType = newRepeatType
    this.setState({ settings })
  }

  weekJSX = (week: Week, repeatType: RepeatType): React.ReactElement<{}>[] => {
    const weekJSX: React.ReactElement<{}>[] = []

    for (let key in week) {
      weekJSX.push(<div key={key}>
        <input type="checkbox" id={"alarm_"+key} checked={week[key]}
          disabled={repeatType === 'countdown'}
          onChange={() => {
            const settings = cloneDeep(this.state.settings)
            settings.repeatDaysOfWeek[key] = !week[key]
            this.setState({ settings }, this.updateRepeatType)
          }} />
        <label htmlFor={"alarm_"+key}>{capitalize(key)}</label>
      </div>)
    }
    return weekJSX
  }

  render () {
    const { settings } = this.state
    return(
      <div className="settings-container">
        <div className="settings-section">
          <div className="settings-header">Default settings</div>

          <div className="settings__block">
            <div className="margin-right">Alarm type</div>
            <Dropdown options={['alarm', 'timer', 'stopwatch']}
              onChange={e => this.updateSettingsKey('alarmType', e.value)}
              value={settings.alarmType} />

            <div className="margin-right margin-left">Alarm state</div>
            <Dropdown options={['enabled', 'disabled']}
              onChange={e => this.updateSettingsKey('alarmState', e.value)}
              value={settings.alarmState} />
          </div>

          <div className="settings__block">
            <input type="text" autoComplete="off" className="" value={settings.descAlarm}
              onChange={e => this.updateSettingsKey('descAlarm', settings.descAlarm)} />
            <div className="margin-left">alarm description</div>
          </div>

          <div className="settings__block">
            <input type="text" autoComplete="off" className="" value={settings.descTimer}
              onChange={e => this.updateSettingsKey('descStopwatch', settings.descTimer)} />
            <div className="margin-left">timer description</div>
          </div>

          <div className="settings__block">
            <input type="text" autoComplete="off" className="" value={settings.descStopwatch}
              onChange={e => this.updateSettingsKey('descStopwatch', settings.descStopwatch)} />
            <div className="margin-left">stopwatch description</div>
          </div>


          {/* timeToActivateOffset, floorSeconds */}
          <div className="settings__block">
            <input type="number" min="0" value={settings.timeToActivateOffset}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('timeToActivateOffset', e.target.value)
              }}}
            />
            <div className="margin-left">alarm offset</div>
          </div>

          <div className="settings__block">
            <input type="checkbox" id="floor-seconds" checked={settings.floorSeconds}
              onChange={() => this.updateSettingsKey('floorSeconds', !settings.floorSeconds)} />
            <label htmlFor="floor-seconds">Floor offsetted seconds</label>
          </div>


          {/* Repeat */}
          <div className="settings__block">
            <div className="margin-right">Repeat: {settings.repeatType}</div>
          </div>

          <div className="settings__block">
            {this.weekJSX(settings.repeatDaysOfWeek, settings.repeatType)}
          </div>

          <div className="settings__block">
            <input type="checkbox" id="repeat-type" checked={settings.repeatType === 'countdown'}
              onChange={() => this.updateRepeatType(true)} />
            <label htmlFor="repeat-type"
              className="margin-right">Countdown</label>

            <input type="number" min="1" max="10000"
              className="daypicker margin-right"
              value={settings.repeatCountdown}
              onChange={e => {
                if (+e.target.value >= +e.target.min && +e.target.value <= +e.target.max) {
                  this.updateSettingsKey('repeatCountdown', +e.target.value)
              }}}
            />
          </div>


          {/* Sound */}
          <div className="settings__block">
            <input type="checkbox" id="play-sound" checked={settings.playSound}
              disabled={settings.autoStopAlarm}
              onChange={() => this.updateSettingsKey('playSound', !settings.playSound)} />
            <label htmlFor="play-sound">Play sound</label>

            <input type="checkbox" id="repeat-sound" checked={settings.repeatSound}
              disabled={settings.autoStopAlarm}
              onChange={() => this.updateSettingsKey('repeatSound', !settings.repeatSound)} />
            <label htmlFor="repeat-sound">Repeat sound</label>
          </div>

          <div className="settings__block">
            <div className="sound-upload">
              <div className="sound-btn">Select sound to play</div>
              <input type="file" name="sound-file" accept="audio/mp3"
                onChange={e => {
                  e.preventDefault()
                  const newSoundPath = e.target.files[0].path
                  this.updateSettingsKey('soundPath', newSoundPath)
                }} />

              <div className="sound-path">{
                settings.soundPath.split('/').pop()}</div>
            </div>
          </div>


          {/* Command */}
          <div className="settings__block">
            <input type="checkbox" id="start-application" checked={settings.startApplication}
              onChange={() => this.updateSettingsKey('startApplication', !settings.startApplication)} />
            <label htmlFor="start-application">Start application</label>

            <input type="checkbox" id="auto-stop-alarm" checked={settings.autoStopAlarm}
              onChange={() => this.updateSettingsKey('autoStopAlarm', !settings.autoStopAlarm)} />
            <label htmlFor="auto-stop-alarm">Stop alarm automatically</label>
          </div>

          <div className="settings__block">Command</div>
          <div className="settings__block">
            <input type="text" autoComplete="off" className="margin-bottom flex-grow"
              disabled={!settings.startApplication} value={settings.applicationCommand}
              onChange={(e) => this.updateSettingsKey('applicationCommand', e.target.value)} />
          </div>


          {/* timerTimeToWait, stopwatchTotalTime */}
          <div className="settings__block">
            <input type="number" min="0" value={settings.timerTimeToWait}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('timerTimeToWait', e.target.value)
              }}}
            />
            <div className="margin-left">timer time to wait</div>
          </div>

          <div className="settings__block">
            <input type="number" min="0" value={settings.stopwatchTotalTime}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('stopwatchTotalTime', e.target.value)
              }}}
            />
            <div className="margin-left">stopwatch initial seconds</div>
          </div>


          <div className="settings-header">Program settings</div>

          {/* postponeOffset, autoStopAfterMMIsActive, autoStopAfterMM */}
          <div className="settings__block">
            <input type="number" min="0" value={settings.postponeOffset}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('postponeOffset', e.target.value)
              }}}
            />
            <div className="margin-left">postpone seconds</div>
          </div>

          <div className="settings__block">
            <input type="checkbox" id="auto-stop-alarm" checked={settings.autoStopAfterMMIsActive}
              onChange={() => this.updateSettingsKey('autoStopAfterMMIsActive', !settings.autoStopAfterMMIsActive)} />
            <label htmlFor="auto-stop-alarm">Auto stop after</label>

            <input type="number" min="0" value={settings.autoStopAfterMM}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('autoStopAfterMM', e.target.value)
              }}}
            />
            <div className="margin-left">minutes</div>
          </div>


          {/* showNotification, trayMonoIcon, showRepeatInfo, startInTray */}
          <div className="settings__block">
            <input type="checkbox" id="show-notification" checked={settings.showNotification}
              onChange={() => this.updateSettingsKey('showNotification', !settings.showNotification)} />
            <label htmlFor="show-notification">Show notification</label>
          </div>

          <div className="settings__block">
            <input type="checkbox" id="tray-mono-icon" checked={settings.trayMonoIcon}
              onChange={() => this.updateSettingsKey('trayMonoIcon', !settings.trayMonoIcon)} />
            <label htmlFor="tray-mono-icon">Tray mono icon</label>
          </div>

          <div className="settings__block">
            <input type="checkbox" id="show-repeat-info" checked={settings.showRepeatInfo}
              onChange={() => this.updateSettingsKey('showRepeatInfo', !settings.showRepeatInfo)} />
            <label htmlFor="show-repeat-info">Show repeat info</label>
          </div>

          <div className="settings__block">
            <input type="checkbox" id="start-in-tray" checked={settings.startInTray}
              onChange={() => this.updateSettingsKey('startInTray', !settings.startInTray)} />
            <label htmlFor="start-in-tray">Start in tray</label>
          </div>


          {/* listWidthPx, editWidthPx, appHeightPx */}
          <div className="settings__block">
            <input type="number" min="0" value={settings.listWidthPx}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('listWidthPx', e.target.value)
              }}}
            />
            <div className="margin-left">alarms list width px</div>
          </div>

          <div className="settings__block">
            <input type="number" min="0" value={settings.editWidthPx}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('editWidthPx', e.target.value)
              }}}
            />
            <div className="margin-left">edit block width px</div>
          </div>

          <div className="settings__block">
            <input type="number" min="0" value={settings.appHeightPx}
              onChange={e => {
                if (+e.target.value >= +e.target.min) {
                  this.updateSettingsKey('appHeightPx', e.target.value)
              }}}
            />
            <div className="margin-left">edit app height px</div>
          </div>


          {/* Save, Restore default */}
          <div className="settings__block">
            <div className="settings__btn save"
              onClick={this.saveSettings}>Save</div>

            <div className="settings__btn restore"
              onClick={this.restoreDefaultSettings}>Restore default</div>
          </div>
        </div>
      </div>
    )
  }
}
