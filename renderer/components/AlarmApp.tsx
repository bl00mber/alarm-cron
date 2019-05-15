/*
 * Copyright Nick Reiley <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as React from 'react'
// @ts-ignore
import * as _ from 'underscore-plus'
import EditAlarm from './EditAlarm'
import Alarm from '../classes/Alarm'
import { AlarmFields, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

import '../style/AlarmApp.scss'

declare global {
  interface Date {
    toLocalISOString(): string;
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

// Defaults, needs to be placed into app/settings
const defAl: AlarmFields = {
  alarmType: 'alarm',
  description: 'Alarm',
  alarmState: 'enabled',
  timeToActivate: new Date(),
  repeatType: 'once',
  repeatDaysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
  repeatCountdown: 0,
  playSound: true,
  soundPath: '', // here should be default mp3
  repeatSound: true,
  startApplication: false,
  autoStopAlarm: false,
  applicationCommand: '',

  timerTimeFrom: new Date(),
  timerTimeToWait: 600,

  stopwatchTimeFrom: new Date(),
  stopwatchTotalTime: 0,
}

interface State {
  defAl: Alarm,
  alarms?: Alarm[],
  selectedAlarmIndex: number | undefined,
}

export default class AlarmApp extends React.Component<any, State> {
  constructor(props: object) {
    super(props)

    const alarm = new Alarm({
      alarmType: defAl.alarmType, description: defAl.description, alarmState: defAl.alarmState,
      timeToActivate: defAl.timeToActivate,
      repeatType: defAl.repeatType, repeatDaysOfWeek: defAl.repeatDaysOfWeek,
      repeatCountdown: defAl.repeatCountdown,
      playSound: defAl.playSound, soundPath: defAl.soundPath, repeatSound: defAl.repeatSound,
      startApplication: defAl.startApplication, autoStopAlarm: defAl.autoStopAlarm,
      applicationCommand: defAl.applicationCommand,
    })

    this.state = {
      defAl: alarm,
      // alarms: [],
      // selectedAlarmIndex: undefined,

      // dev
      alarms: [alarm],
      selectedAlarmIndex: 0,
    }
  }

  toddMMHHmmss (date: Date): string {
    const month = date.toLocaleString('en-us', { month: 'short' })
    return date.getDay()+' '+month+' '+date.toLocalISOString().slice(11,19)
  }

  toDDHHmmss (ss_total: number): string {
    let str = ''
    const dd = Math.floor(ss_total/86400)
    let ss_rem = ss_total%86400

    const hh = Math.floor(ss_rem/3600)
    let mm: any = Math.floor((ss_rem-(hh*3600))/60)
    let ss: any = ss_rem-(hh*3600)-(mm*60)

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
    const alarmsJSX: React.ReactElement<{}>[] = []
    this.state.alarms.map((alarm: Alarm, index: number) => {
      alarmsJSX.push(<div key={index} className="alarm-container">
        <div className={this.getAlarmIconClass(alarm.alarmType)}></div>
        {this.alarmCountdownsJSX(alarm.alarmType, alarm)}
        <div className="alarm-description padding">{alarm.description}</div>
        {this.alarmStateBtnJSX(alarm.alarmState)}
      </div>
    )})
    return alarmsJSX
  }

  render() {
    const { alarms, selectedAlarmIndex } = this.state
    return (
      <div className="app-container">
        <div className="alarms-container">
          <div className="alarms-controls">
            <div className="alarms-modification-controls padding">
              <div className="new-alarm btn"></div>
              <div className="edit-alarm btn"></div>
              <div className="delete-alarm btn btn-last"></div>
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

        {selectedAlarmIndex !== undefined &&
        <div className="settings-container">
          <EditAlarm alarm={alarms[selectedAlarmIndex]} defAl={defAl} />
          <div className="settings-footer padding">
            <div className="app-settings btn-padding">Settings</div>
            <div className="app-about btn-padding btn-last">About</div>
          </div>
        </div>
        }
      </div>
    )
  }
}
