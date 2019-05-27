/*
 * Copyright Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as React from 'react'
// @ts-ignore
import cloneDeep from 'lodash.clonedeep'
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
  descAlarm: 'Alarm',
  descTimer: 'Timer',
  descStopwatch: 'Stopwatch',
  alarmState: 'enabled',

  defaultOffset: 600, // timeToActivate
  floorSeconds: false,
  repeatType: 'once',
  repeatDaysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
  repeatCountdown: 1,
  playSound: true,
  soundPath: '', // here should be default mp3
  repeatSound: true,
  startApplication: false,
  autoStopAlarm: false,
  applicationCommand: '',

  // timerTimeToWait: 600, // prod
  timerTimeToWait: 5,
  stopwatchTotalTime: 0,

  postponeOffset: 300,
  // autoDisableAlarms: false, // prod
  autoDisableAlarms: true,
  autoDisableAfterMM: 10,
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
      alarmType: defaults.alarmType, description: defaults.descAlarm,
      alarmState: defaults.alarmState,
      timeToActivate: this.addSecondsToNow(defaults.defaultOffset),
      repeatType: defaults.repeatType, repeatDaysOfWeek: defaults.repeatDaysOfWeek,
      repeatCountdown: defaults.repeatCountdown, repeatFrom: new Date(),
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
    this.currentTimeInterval = setInterval(() =>
      this.setState({ currentTime: new Date() }, this.alarmsHandler), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.currentTimeInterval)
  }

  alarmsHandler = () => {
    const { alarms, currentTime } = this.state
    const alarmsUpd = alarms.map((alarm, index) => {

      if (alarm.alarmState === 'enabled') {
        if (alarm.alarmType === 'alarm') {
          if (currentTime.getTime() > alarm.timeToActivate.getTime()) {
            alarm.alarmState = 'active'
          }
        }
        else if (alarm.alarmType === 'timer') {
            alarm.timerTimeToWaitCountdown -= 1
          if (alarm.timerTimeToWaitCountdown === 0) {
            alarm.alarmState = 'active'
          }
        }
        else if (alarm.alarmType === 'stopwatch') {
          alarm.stopwatchTotalTime += 1
        }
      }

      // Disable alarms that has been active for more than certain time without turning off
      if (alarm.alarmState === 'active' && defaults.autoDisableAlarms) {
        if (alarm.alarmType === 'alarm') {
          if (currentTime.getTime() >
            (alarm.timeToActivate.getTime() + defaults.autoDisableAfterMM*60000)) {
            alarm.resetAlarm()
          }
        }
        else if (alarm.alarmType === 'timer') {
          if (alarm.timerTimeToWaitCountdown < defaults.autoDisableAfterMM*-60) {
            alarm.resetTimer()
          }
        }
      }
      return alarm
    })
    this.setState({ alarms: alarmsUpd })
  }

  addSecondsToNow = (seconds: number): Date => {
    // currentTime -> timestamp/1000 -> +ss -> timestamp*1000 -> new Date
    // then set date seconds to 00
    let currentTime
    if (this.state) { currentTime = this.state.currentTime }
    else { currentTime = new Date() }
    const deferredDate = new Date((Math.floor(currentTime.getTime()/1000)+seconds)*1000)
    if (defaults.floorSeconds) deferredDate.setSeconds(0)
    return deferredDate
  }

  toDDMMHHmmss (date: Date): string {
    const month = date.toLocaleString('en-us', { month: 'short' })
    return date.getDate()+' '+month+' '+date.toLocalISOString().slice(11,19)
  }

  toDDHHmmss (ssTotal: number, alarmType: AlarmType): string {
    if (ssTotal < 1 && alarmType !== 'stopwatch') return 'Expired'
    let str = ''
    const dd = Math.floor(ssTotal/86400)
    let ssRem = ssTotal%86400

    const hh = Math.floor(ssRem/3600)
    let mm: any = Math.floor((ssRem-(hh*3600))/60)
    let ss: any = ssRem-(hh*3600)-(mm*60)

    if (mm < 10) {mm = '0'+mm}
    if (ss < 10) {ss = '0'+ss}

    if (dd == 0) { str = hh+':'+mm+':'+ss }
    else { str = dd+'D '+hh+':'+mm+':'+ss }
    return str
  }

  ssBeforeDateFromNow (date: Date): number {
    const now = new Date()
    return Math.floor((date.getTime()-now.getTime())/1000)
  }

  weekToStr (repeatDaysOfWeek: Week): string {
    let weekStr = ''
    for (let key in repeatDaysOfWeek) {
      if (repeatDaysOfWeek[key]) {
        if (weekStr.length > 0) { weekStr = weekStr+', '+key.capitalize() }
        else { weekStr += key.capitalize() }
      }
    }
    return weekStr
  }

  repeatCountdownToStr (repeatFrom: Date, repeatCountdown: number): string {
    const day = repeatFrom.getDate()
    const month = repeatFrom.toLocaleString('en-us', { month: 'short' })
    const year = repeatFrom.getFullYear()
    return 'Every '+Number(repeatCountdown)+' day from '+day+' '+month+' '+year
  }

  repeatToJSX (
    repeatType: RepeatType, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date
  ): React.ReactElement<{}> {
    switch(repeatType) {
      case 'once': return null
      case 'weekly': return <div className="alarm-countdown-child">
        {this.weekToStr(repeatDaysOfWeek)}
      </div>
      case 'countdown': return <div className="alarm-countdown-child">
        {this.repeatCountdownToStr(repeatFrom, repeatCountdown)}
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
        const ssRemained = this.ssBeforeDateFromNow(alarm.timeToActivate)
        return <div className={"alarm-countdown"+((ssRemained<1)?' expired':'')}>
          <div className="alarm-countdown-child">
            {this.toDDMMHHmmss(alarm.timeToActivate)}
          </div>

          {this.repeatToJSX(
            alarm.repeatType,
            alarm.repeatDaysOfWeek,
            alarm.repeatCountdown,
            alarm.repeatFrom,
          )}

          <div className="alarm-countdown-child">
            {this.toDDHHmmss(ssRemained, alarm.alarmType)}
          </div>
        </div>
      case 'timer':
        return <div className={"alarm-countdown"+
          ((alarm.timerTimeToWaitCountdown<1)?' expired':'')}>
          {this.toDDHHmmss(alarm.timerTimeToWaitCountdown, alarm.alarmType)}</div>
      case 'stopwatch':
        return <div className="alarm-countdown">
          {this.toDDHHmmss(alarm.stopwatchTotalTime, alarm.alarmType)}</div>
    }
  }

  alarmsJSX = (): React.ReactElement<{}>[] => {
    const { alarms, selectedAlarmIndex } = this.state
    const alarmsJSX: React.ReactElement<{}>[] = []

    alarms.map((alarm: Alarm, index: number) => {
      alarmsJSX.push(<div key={index} className={"alarm-container" +
          (index === selectedAlarmIndex ? ' active' : '')}>
        <div className="alarm-select-container"
          onClick={() => {
            if (selectedAlarmIndex === index) {
              this.setState({ selectedAlarmIndex: null })
            } else {
              this.setState({ selectedAlarmIndex: index })
            }
          }}>
          <div className={this.getAlarmIconClass(alarm.alarmType)}></div>
          {this.alarmCountdownsJSX(alarm.alarmType, alarm)}
          <div className="alarm-description padding">{alarm.description}</div>
        </div>
        <div className={"alarm-handler__btn padding "+
          this.getAlarmHandlerClass(alarm.alarmState)}
          onClick={() => this.runAlarmHandler(alarm.alarmType, alarm.alarmState, index)}></div>
      </div>
    )})
    return alarmsJSX
  }

  // Modification controls handlers
  setDefaultAlarm = () => {
    const alarm = new Alarm({
      alarmType: defaults.alarmType, description: defaults.descAlarm, alarmState: defaults.alarmState,
      timeToActivate: this.addSecondsToNow(defaults.defaultOffset),
      repeatType: defaults.repeatType, repeatDaysOfWeek: defaults.repeatDaysOfWeek,
      repeatCountdown: defaults.repeatCountdown, repeatFrom: new Date(),
      playSound: defaults.playSound, soundPath: defaults.soundPath, repeatSound: defaults.repeatSound,
      startApplication: defaults.startApplication, autoStopAlarm: defaults.autoStopAlarm,
      applicationCommand: defaults.applicationCommand,
    })
    this.setState({ alarms: [...this.state.alarms, alarm] })
  }

  deleteSelectedAlarmIndex = () => {
    const { alarms } = this.state
    let { selectedAlarmIndex } = this.state
    if (selectedAlarmIndex === null) return;
    alarms.splice(selectedAlarmIndex, 1)
    if (alarms.length != 0) {
      selectedAlarmIndex = alarms.length-1 // select last alarm
    } else {
      selectedAlarmIndex = null
    }
    this.setState({ alarms, selectedAlarmIndex })
  }

  updateAlarmKey = (key: string, value: any, callback?: () => any) => {
    const { alarms, selectedAlarmIndex } = this.state
    alarms[selectedAlarmIndex][key] = value

    // Alarm enabled state is disabled before time change to prevent
    // accidental alarm activation
    if (key === 'timeToActivate' || key === 'timerTimeToWait')
      alarms[selectedAlarmIndex].alarmState = 'disabled'

    if (callback) { this.setState({ alarms }, callback) }
    else { this.setState({ alarms }) }
  }

  updateAlarmInstance = (alarm: Alarm, alarmIndex?: number, callback?: () => any) => {
    const { alarms, selectedAlarmIndex } = this.state
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarms[alarmIndex] = alarm
    if (callback) { this.setState({ alarms }, callback) }
    else { this.setState({ alarms }) }
  }

  /**
   * Process controls: enabled->pause, disabled->enable, active->reset
   * pause: enabled->disabled
   * activate: disabled->enabled
   * reset: active->disabled
   * since stopwatch cannot be active, handler ${resetStopwatch} should be accessed directly
   * if alarmIndex is not set, selectedAlarmIndex used
  */
  runAlarmHandler = (alarmType: AlarmType, alarmState: AlarmStateType, alarmIndex?: number) => {
    const { alarms, selectedAlarmIndex } = this.state
    let alarm
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarm = cloneDeep(alarms[alarmIndex])

    const handlerKey = this.getAlarmHandlerKey(alarmType, alarmState)
    alarm[handlerKey]()

    this.updateAlarmInstance(alarm, alarmIndex)
  }

  runCustomAlarmHandler = (handlerKey: string, args?: any[], alarmIndex?: number) => {
    const { alarms, selectedAlarmIndex } = this.state
    let alarm
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarm = cloneDeep(alarms[alarmIndex])

    if (args) { alarm[handlerKey](...args) }
    else { alarm[handlerKey]() }
    this.updateAlarmInstance(alarm, alarmIndex)
  }

  getAlarmHandlerKey = (alarmType: AlarmType, alarmState: AlarmStateType): string => {
    switch(alarmType) {
      case 'alarm':
        switch(alarmState) {
          case 'enabled': return 'pauseAlarm'
          case 'disabled': return 'enableAlarm'
          case 'active': return 'resetAlarm'
        }
        break
      case 'timer':
        switch(alarmState) {
          case 'enabled': return 'pauseTimer'
          case 'disabled': return 'enableTimer'
          case 'active': return 'resetTimer'
        }
        break
      case 'stopwatch':
        switch(alarmState) {
          case 'enabled': return 'pauseStopwatch'
          case 'disabled': return 'enableStopwatch'
        }
        break
      default:
        console.error('wrong alarm state')
    }
  }

  getAlarmHandlerClass = (alarmState: AlarmStateType): string => {
    switch(alarmState) {
      case 'enabled': return 'pause'
      case 'disabled': return 'enable'
      case 'active': return 'reset'
    }
  }

  // Process all alarms
  resetAllActiveAlarms = () => {
    const { alarms } = this.state
    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'active') {
        const updAlarm = cloneDeep(alarms[index])
        updAlarm.resetAlarm()
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  postponeAllActiveAlarms = () => {
    const { alarms } = this.state
    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'active' &&
        alarm.alarmType === 'alarm' || alarm.alarmType === 'timer') {
        const updAlarm = cloneDeep(alarms[index])

        if (alarm.alarmType === 'alarm') {
          updAlarm.postponeAlarm(defaults.postponeOffset) }
        else if (alarm.alarmType === 'timer') {
          updAlarm.postponeTimer(defaults.postponeOffset) }
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  render() {
    const { alarms, currentTime, selectedAlarmIndex, editIsEnabled } = this.state
    return (
      <div className="app-container">
        <div className="alarms-container">
          <div className="alarms-controls">
            <div className="alarms-modification-controls padding-controls">
              <div className="new-alarm btn"
                onClick={this.setDefaultAlarm}></div>
              <div className={"edit-alarm btn" + (editIsEnabled ? ' active': '')}
                onClick={() => this.setState({
                  editIsEnabled: !editIsEnabled,
                  selectedAlarmIndex: undefined,
                })}></div>
              <div className="delete-alarm btn btn-last"
                onClick={this.deleteSelectedAlarmIndex}></div>
            </div>

            <div className="alarms-process-controls padding-controls">
              <div className="stop-active-alarms btn"
                onClick={this.resetAllActiveAlarms}></div>
              <div className="postpone-active-alarms btn btn-last"
                onClick={this.postponeAllActiveAlarms}></div>
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
            updateAlarmKey={this.updateAlarmKey}
            updateAlarmInstance={this.updateAlarmInstance}
            addSecondsToNow={this.addSecondsToNow}
            toDDHHmmss={this.toDDHHmmss}
            runAlarmHandler={this.runAlarmHandler}
            runCustomAlarmHandler={this.runCustomAlarmHandler}
            getAlarmHandlerClass={this.getAlarmHandlerClass}
          />
          <div className="settings-footer padding-controls">
            <div className="app-settings btn-padding">Settings</div>
            <div className="app-about btn-padding btn-last">About</div>
          </div>
        </div>}
      </div>
    )
  }
}
