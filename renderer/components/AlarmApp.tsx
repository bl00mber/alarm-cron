import * as React from 'react'
// @ts-ignore
import * as _ from 'underscore-plus'
import EditAlarm from './EditAlarm'
import Alarm from '../classes/Alarm'
import { AlarmInterface, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

// Defaults, needs to be placed into app/settings
const defAl: AlarmInterface = {
  alarmType: 'alarm',
  description: 'Alarm',
  alarmState: 'enabled',
  timeToActivate: new Date(),
  repeatType: 'once',
  repeatDaysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
  repeatCountdown: 0,
  repeatFrom: new Date(),
  playSound: true,
  soundPath: '', // here should be default mp3
  repeatSound: true,
  startApplication: false,
  applicationCommand: '',
}

interface State {
  alarms?: Alarm[]
}

export default class AlarmApp extends React.Component<any, State> {
  constructor(props: object) {
    super(props)

    const alarm = new Alarm({
      alarmType: defAl.alarmType, description: defAl.description, alarmState: defAl.alarmState,
      timeToActivate: defAl.timeToActivate,
      repeatType: defAl.repeatType, repeatDaysOfWeek: defAl.repeatDaysOfWeek,
      repeatCountdown: defAl.repeatCountdown, repeatFrom: defAl.repeatFrom,
      playSound: defAl.playSound, soundPath: defAl.soundPath, repeatSound: defAl.repeatSound,
      startApplication: defAl.startApplication, applicationCommand: defAl.applicationCommand
    })

    this.state = {
      alarms: [alarm]
    }
  }

  toddMMHHmmss = (date: Date): string => {
    const month = date.toLocaleString('en-us', { month: 'short' })
    return date.getDay()+' '+month+' '+date.toISOString().slice(11,19)
  }

  toDDHHmmss = (ss_total: number): string => {
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

  ssBeforeDateFromNow = (date: Date): number => {
    const now = new Date()
    return Math.floor((date.getTime()-now.getTime())/1000)
  }

  weekToStr = (repeatDaysOfWeek: Week): string => {
    let str = ''
    for (let key in repeatDaysOfWeek) {
      if (repeatDaysOfWeek[key]) {
        if (str.length === 0) {str += repeatDaysOfWeek[key]}
        else {str = str+', '+repeatDaysOfWeek[key]}
      }
    }
    return str
  }

  repeatCountdownToStr = (repeatCountdown: number, repeatFrom: Date): string => {
    const day = repeatFrom.getDay()
    const month = repeatFrom.toLocaleString('en-us', { month: 'short' })
    const year = repeatFrom.getFullYear()
    return 'every '+Number(repeatCountdown)+' day from '+day+' '+month+' '+year
  }

  repeatToJSX = (
    repeatType: RepeatType, repeatDaysOfWeek: Week | undefined,
    repeatCountdown: number | undefined, repeatFrom: Date | undefined
  ): React.ReactElement<{}> => {
    switch(repeatType) {
      case 'once': return <div></div>
      case 'weekly': return <div className="alarm-countdown-child">
        {this.weekToStr(repeatDaysOfWeek)}
      </div>
      case 'countdown': return <div className="alarm-countdown-child">
        {this.repeatCountdownToStr(repeatCountdown, repeatFrom)}
      </div>
    }
  }

  getAlarmIconClass = (alarmType: AlarmType): string => {
    switch(alarmType) {
      case 'alarm': return 'icon-alarm'
      case 'timer': return 'icon-timer'
      case 'stopwatch': return 'icon-stopwatch'
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

          {_.memoize(this.repeatToJSX(
            alarm.repeatType,
            alarm.repeatDaysOfWeek,
            alarm.repeatCountdown,
            alarm.repeatFrom,
          ))}

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

  alarmStateBtnJSX = (alarmState: AlarmStateType): React.ReactElement<{}> => {
    switch(alarmState) {
      case 'enabled': return <div className="disable-alarm__btn"></div>
      case 'disabled': return <div className="enable-alarm__btn"></div>
      case 'active': return <div className="stop-alarm__btn"></div>
    }
  }

  alarmsListJSX = (): React.ReactElement<{}> => {
    return (
      <div className="alarms-list">
        {this.state.alarms.map((alarm: Alarm, index: number) => {
          <div key={index} className="alarm-container">
            <div className={this.getAlarmIconClass(alarm.alarmType)}></div>
            {this.alarmCountdownsJSX(alarm.alarmType, alarm)}
            <div className="">{alarm.description}</div>
            {this.alarmStateBtnJSX(alarm.alarmState)}
          </div>
        })}
      </div>
    )
  }

  render() {
    return (
      <div className="app-container">
        <div className="alarms-container">
          <div className="alarms-controls">
            <div className="alarms-modification-controls">
              <div className="new-alarm__btn"></div>
              <div className="edit-alarm__btn"></div>
              <div className="delete-alarm__btn"></div>
            </div>

            <div className="alarms-process-controls">
              <div className="stop-ringing-alarms__btn"></div>
              <div className="delay-ringing-alarms__btn"></div>
            </div>
          </div>

          {this.alarmsListJSX()}
        </div>

        <div className="settings-container">
          <EditAlarm />
          <div className="settings-footer">
            <div className="app-settings__btn"></div>
            <div className="app-about__btn"></div>
          </div>
        </div>
      </div>
    )
  }
}
