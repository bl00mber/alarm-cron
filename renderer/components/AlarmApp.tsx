/*
 * Copyright Nick Reiley <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as React from 'react'
import EditAlarm from './EditAlarm'
import Alarm from '../classes/Alarm'
import { DefaultFields, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

import '../style/AlarmApp.scss'

declare global {
  interface Date {
    toLocalISOString(): string;
  }
  interface String {
    capitalize(): string;
  }
}

Date.prototype.toLocalISOString = function() {
  let tzo = -this.getTimezoneOffset(),
    dif = tzo >= 0 ? '+' : '-',
    pad = function(num: number) {
      let norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };
  return this.getFullYear() +
    '-' + pad(this.getMonth() + 1) +
    '-' + pad(this.getDate()) +
    'T' + pad(this.getHours()) +
    ':' + pad(this.getMinutes()) +
    ':' + pad(this.getSeconds()) +
    dif + pad(tzo / 60) +
    ':' + pad(tzo % 60);
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// Defaults, needs to be placed into app/settings
const defaults: DefaultFields = {
  alarmType: 'alarm',
  description: 'Alarm',
  alarmState: 'enabled',

  defaultOffset: 600, // timeToActivate
  repeatType: 'once',
  repeatDaysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
  repeatCountdown: 1,
  playSound: true,
  soundPath: '', // here should be default mp3
  repeatSound: true,
  startApplication: false,
  autoStopAlarm: false,
  applicationCommand: '',

  timerTimeToWait: 600,
  stopwatchTotalTime: 0,
}

interface State {
  defaults: Alarm,
  currentTime: Date,
  alarms?: Alarm[],
  selectedAlarmIndex: number | null,
  editIsEnabled: boolean,
}

export default class AlarmApp extends React.Component<any, State> {
  currentTimeInterval: NodeJS.Timeout;

  constructor(props: object) {
    super(props)

    const alarm = new Alarm({
      alarmType: defaults.alarmType, description: defaults.description,
      alarmState: defaults.alarmState,
      timeToActivate: this.addSecondsToNow(defaults.defaultOffset),
      repeatType: defaults.repeatType, repeatDaysOfWeek: defaults.repeatDaysOfWeek,
      repeatCountdown: defaults.repeatCountdown,
      playSound: defaults.playSound, soundPath: defaults.soundPath, repeatSound: defaults.repeatSound,
      startApplication: defaults.startApplication, autoStopAlarm: defaults.autoStopAlarm,
      applicationCommand: defaults.applicationCommand,
    })

    this.state = {
      defaults: alarm,
      currentTime: new Date(),
      // alarms: [],
      // selectedAlarmIndex: null,
      // editIsEnabled: false,

      // dev
      alarms: [alarm],
      selectedAlarmIndex: 0,
      editIsEnabled: true,
    }
  }

  componentDidMount() {
    // this.currentTimeInterval = setInterval(() => this.setState({ currentTime: new Date() }), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.currentTimeInterval)
  }

  addSecondsToNow = (seconds: number): Date => {
    // currentTime -> timestamp/1000 -> +ss -> timestamp*1000 -> new Date
    let currentTime
    if (this.state) { currentTime = this.state.currentTime }
    else { currentTime = new Date() }
    return new Date((Math.floor(currentTime.getTime()/1000)+seconds)*1000)
  }

  toddMMHHmmss (date: Date): string {
    const month = date.toLocaleString('en-us', { month: 'short' })
    return date.getDay()+' '+month+' '+date.toLocalISOString().slice(11,19)
  }

  toDDHHmmss (ssTotal: number): string {
    let str = ''
    const dd = Math.floor(ssTotal/86400)
    let ssRem = ssTotal%86400

    const hh = Math.floor(ssRem/3600)
    let mm: any = Math.floor((ssRem-(hh*3600))/60)
    let ss: any = ssRem-(hh*3600)-(mm*60)

    if (mm < 10) {mm = '0'+mm}
    if (ss < 10) {ss = '0'+ss}

    if (dd == 0) { str = hh+':'+mm+':'+ss }
    else { str = dd+' D '+hh+':'+mm+':'+ss }
    return str
  }

  ssBeforeDateFromNow (date: Date): number {
    const now = new Date()
    return Math.floor((date.getTime()-now.getTime())/1000)
  }

  weekToStr (repeatDaysOfWeek: Week): string {
    let str = ''
    for (let key in repeatDaysOfWeek) {
      if (repeatDaysOfWeek[key]) {
        if (str.length === 0) {str += repeatDaysOfWeek[key]}
        else {str = str+', '+repeatDaysOfWeek[key]}
      }
    }
    return str
  }

  repeatCountdownToStr (timeToActivate: Date, repeatCountdown: number): string {
    const day = timeToActivate.getDay()
    const month = timeToActivate.toLocaleString('en-us', { month: 'short' })
    const year = timeToActivate.getFullYear()
    return 'every '+Number(repeatCountdown)+' day from '+day+' '+month+' '+year
  }

  repeatToJSX (
    timeToActivate: Date | undefined,
    repeatType: RepeatType, repeatDaysOfWeek: Week | undefined,
    repeatCountdown: number | undefined,
  ): React.ReactElement<{}> {
    switch(repeatType) {
      case 'once': return <div></div>
      case 'weekly': return <div className="alarm-countdown-child">
        {this.weekToStr(repeatDaysOfWeek)}
      </div>
      case 'countdown': return <div className="alarm-countdown-child">
        {this.repeatCountdownToStr(timeToActivate, repeatCountdown)}
      </div>
    }
  }

  getAlarmIconClass (alarmType: AlarmType): string {
    switch(alarmType) {
      case 'alarm': return 'icon-alarm padding'
      case 'timer': return 'icon-timer padding'
      case 'stopwatch': return 'icon-stopwatch padding'
    }
  }

  alarmCountdownsJSX = (
    alarmType: AlarmType, alarm: Alarm): React.ReactElement<{}> => {
    switch(alarmType) {
      case 'alarm':
        return <div className="alarm-countdown">
          <div className="alarm-countdown-child">
            {this.toddMMHHmmss(alarm.timeToActivate)}
          </div>

          {this.repeatToJSX(
            alarm.timeToActivate,
            alarm.repeatType,
            alarm.repeatDaysOfWeek,
            alarm.repeatCountdown,
          )}

          <div className="alarm-countdown-child">
            {this.toDDHHmmss(this.ssBeforeDateFromNow(alarm.timeToActivate))}
          </div>
        </div>
      case 'timer':
        return <div className="alarm-countdown">{this.toDDHHmmss(alarm.timerTimeToWait)}</div>
      case 'stopwatch':
        return <div className="alarm-countdown">{this.toDDHHmmss(alarm.stopwatchTotalTime)}</div>
    }
  }

  alarmStateBtnJSX (alarmState: AlarmStateType): React.ReactElement<{}> {
    switch(alarmState) {
      case 'enabled': return <div className="disable-alarm__btn padding"></div>
      case 'disabled': return <div className="enable-alarm__btn padding"></div>
      case 'active': return <div className="stop-alarm__btn padding"></div>
    }
  }

  alarmsJSX = (): React.ReactElement<{}>[] => {
    const { alarms, selectedAlarmIndex } = this.state
    const alarmsJSX: React.ReactElement<{}>[] = []

    alarms.map((alarm: Alarm, index: number) => {
      alarmsJSX.push(<div key={index} className={"alarm-container" +
          (index === selectedAlarmIndex ? ' active' : '')}
          onClick={() => this.setState({ selectedAlarmIndex: index })}>
        <div className={this.getAlarmIconClass(alarm.alarmType)}></div>
        {this.alarmCountdownsJSX(alarm.alarmType, alarm)}
        <div className="alarm-description padding">{alarm.description}</div>
        {this.alarmStateBtnJSX(alarm.alarmState)}
      </div>
    )})
    return alarmsJSX
  }

  // Modification controls handlers
  createDefaultAlarm = () => {
    const alarm = new Alarm({
      alarmType: defaults.alarmType, description: defaults.description, alarmState: defaults.alarmState,
      timeToActivate: this.addSecondsToNow(defaults.defaultOffset),
      repeatType: defaults.repeatType, repeatDaysOfWeek: defaults.repeatDaysOfWeek,
      repeatCountdown: defaults.repeatCountdown,
      playSound: defaults.playSound, soundPath: defaults.soundPath, repeatSound: defaults.repeatSound,
      startApplication: defaults.startApplication, autoStopAlarm: defaults.autoStopAlarm,
      applicationCommand: defaults.applicationCommand,
    })
    this.setState({ alarms: [...this.state.alarms, alarm] })
  }

  deleteSelectedAlarmIndex = () => {
    const { alarms, selectedAlarmIndex } = this.state
    this.setState({ alarms: alarms.splice(selectedAlarmIndex, 1), selectedAlarmIndex: null })
  }

  updateAlarm = (key: string, value: any, callback?: () => any) => {
    const { alarms, selectedAlarmIndex } = this.state
    alarms[selectedAlarmIndex][key] = value
    if (callback) { this.setState({ alarms }, callback) }
    else { this.setState({ alarms }) }
  }

  rerenderApp = () => {
    this.forceUpdate()
  }

  render() {
    const { alarms, currentTime, selectedAlarmIndex, editIsEnabled } = this.state
    console.log('THIS.STATE', this.state)
    return (
      <div className="app-container">
        <div className="alarms-container">
          <div className="alarms-controls">
            <div className="alarms-modification-controls padding">
              <div className="new-alarm btn"
                onClick={this.createDefaultAlarm}></div>
              <div className={"edit-alarm btn" + (editIsEnabled ? ' active': '')}
                onClick={() => this.setState({ editIsEnabled: !editIsEnabled })}></div>
              <div className="delete-alarm btn btn-last"
                onClick={this.deleteSelectedAlarmIndex}></div>
            </div>

            <div className="alarms-process-controls padding">
              <div className="stop-ringing-alarms btn"></div>
              <div className="delay-ringing-alarms btn btn-last"></div>
            </div>
          </div>

          <div className="alarms-list">
            {(alarms.length > 0) && this.alarmsJSX()}
          </div>
        </div>

        {(editIsEnabled && selectedAlarmIndex !== null) &&
        <div className="settings-container">
          <EditAlarm
            alarm={alarms[selectedAlarmIndex]}
            defaults={defaults}
            currentTime={currentTime}
            rerenderApp={this.rerenderApp}
            updateAlarm={this.updateAlarm}
            addSecondsToNow={this.addSecondsToNow}
            toDDHHmmss={this.toDDHHmmss}
          />
          <div className="settings-footer padding">
            <div className="app-settings btn-padding">Settings</div>
            <div className="app-about btn-padding btn-last">About</div>
          </div>
        </div>}
      </div>
    )
  }
}
