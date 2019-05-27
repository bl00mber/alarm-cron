/*
 * Copyright Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as React from 'react'
// @ts-ignore
import cloneDeep from 'lodash.clonedeep'
// @ts-ignore
import DatePicker from 'react-bootstrap-date-picker'
// @ts-ignore
import TimeField from 'react-simple-timefield'
import Alarm from '../classes/Alarm'
import { AlarmType, AlarmStateType, RepeatType, Week, DefaultFields } from '../types/alarm'

import '../style/EditAlarm.scss'

interface Props {
  alarm: Alarm,
  defaults: DefaultFields,
  currentTime: Date,
  updateAlarmKey: (key: string, value: any, callback?: () => any) => void,
  updateAlarmInstance: (alarm: Alarm, alarmIndex?: number, callback?: () => any) => void,
  addSecondsToNow: (seconds: number) => Date,
  toDDHHmmss: (seconds: number, alarmType: AlarmType) => string,
  runAlarmHandler: (alarmType: AlarmType, alarmState: AlarmStateType, alarmIndex?: number) => void,
  runCustomAlarmHandler: (handlerKey: string, args?: any[], alarmIndex?: number) => void,
  getAlarmHandlerClass: (alarmState: AlarmStateType) => string,
}

export default class EditAlarm extends React.Component<Props, any> {

  localToGlobalISOString = (localISOString: string): string => {
    const dateUTC = new Date(localISOString)
    const tzo = -dateUTC.getTimezoneOffset()
    const dateLocal = new Date((dateUTC.getTime()/1000 + tzo*60)*1000)
    return dateLocal.toISOString()
  }

  // Alarm
  setAlarm = () => {
    const { defaults } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setAlarm({
      alarmType: 'alarm', description: defaults.descAlarm, alarmState: 'disabled',
    })
    this.props.updateAlarmInstance(alarm)
  }

  /**
   * Method with localISO -> globalISO conversion
   * oldValue: globalISOString
   * value: localISOString -> globalISOString
   * newValue: value, oldValue
  */
  updateDate = (alarmKey: string, oldDate: Date, newDateISOLocal: string) => {
    const newDateISO = this.localToGlobalISOString(newDateISOLocal)
    const newDate = new Date(newDateISO)
    const year = newDate.getFullYear()
    const month = newDate.getMonth()
    const day = newDate.getDate()

    const updatedDate = new Date(oldDate.getTime())
    updatedDate.setFullYear(year)
    updatedDate.setMonth(month)
    updatedDate.setDate(day)
    this.props.updateAlarmKey(alarmKey, updatedDate)
  }

  updateTime = (alarmKey: string, oldDate: Date, value: string) => {
    const hours = +value.slice(0,2)
    const minutes = +value.slice(3,5)

    const updatedDate = new Date(oldDate.getTime())
    updatedDate.setHours(hours, minutes, 0)
    this.props.updateAlarmKey(alarmKey, updatedDate)
  }
  // -----------------------------------------

  getTimeFromDate (date: Date): string { // hh:mm
    return date.toLocalISOString().slice(11, 16)
  }

  getDateFromDate (date: Date): string { // DD.MM.YYYY
    const ISOString = date.toLocalISOString()
    const year = ISOString.slice(0,4)
    const month = ISOString.slice(5,7)
    const day = ISOString.slice(8,10)
    return day+'.'+month+'.'+year
  }

  getDateStringFromDate (date: Date): string { // DD.MM.YYYY HH:mm:ss
    const ISOString = date.toLocalISOString()
    const year = ISOString.slice(0,4)
    const month = ISOString.slice(5,7)
    const day = ISOString.slice(8,10)
    return day+'.'+month+'.'+year+' '+date.toLocalISOString().slice(11,19)
  }

  getRepeatString = (): string => {
    const { alarm } = this.props
    switch(alarm.repeatType) {
      case 'once': return 'Once'
      case 'weekly':
        let weekStr = ''
        for (let key in alarm.repeatDaysOfWeek) {
          if (alarm.repeatDaysOfWeek[key]) {
            if (weekStr.length > 0) { weekStr = weekStr+', '+key.capitalize() }
            else { weekStr += key.capitalize() }
          }
        }
        return weekStr
      case 'countdown': return 'Every '+alarm.repeatCountdown+' day from '+this.getDateFromDate(alarm.repeatFrom)
    }
  }

  updateRepeatType = (toggleCountdown?: boolean) => {
    const { alarm } = this.props

    let weekDayIsToggled = false
    for (let key in alarm.repeatDaysOfWeek) {
      if (alarm.repeatDaysOfWeek[key] === true) {
        weekDayIsToggled = true
        break
      }
    }

    let repeatType
    if (toggleCountdown) {
      if (alarm.repeatType === 'once' || alarm.repeatType === 'weekly') {
        repeatType = 'countdown'
      } else {
        if (weekDayIsToggled) { repeatType = 'weekly' }
        else { repeatType = 'once' }
      }
    } else {
      if (weekDayIsToggled) { repeatType = 'weekly' }
      else { repeatType = 'once' }
    }
    this.props.updateAlarmKey('repeatType', repeatType)
  }

  weekJSX = (week: Week, repeatType: RepeatType): React.ReactElement<{}>[] => {
    const weekJSX: React.ReactElement<{}>[] = []

    for (let key in week) {
      weekJSX.push(<div key={key}>
        <input type="checkbox" id={"alarm_"+key} checked={week[key]}
          disabled={repeatType === 'countdown'}
          onChange={() => {
            const { alarm } = this.props
            const week = {...alarm.repeatDaysOfWeek}
            week[key] = !week[key]
            this.props.updateAlarmKey('repeatDaysOfWeek', week, this.updateRepeatType)
          }} />
        <label htmlFor={"alarm_"+key}>{key.capitalize()}</label>
      </div>)
    }
    return weekJSX
  }

  // Timer
  // Remainder is a seconds remainder from overall time divided by days
  setTimer = () => {
    const { defaults } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setTimer({
      alarmType: 'timer', description: defaults.descTimer, alarmState: 'disabled',
      timerTimeToWait: alarm.timerTimeToWait || defaults.timerTimeToWait,
    })
    this.props.updateAlarmInstance(alarm)
  }

  getDaysTimerTimeToWait (timerTimeToWait: number): number { // DD
    return Math.floor(timerTimeToWait/86400)
  }

  getTimeTimerTimeToWait = (timerTimeToWait: number): string => { // HH:mm
    const days = Math.floor(timerTimeToWait/86400)
    let remainder, hoursNum, hours, minutes

    if (days !== 0) {
      remainder = timerTimeToWait % 86400
      hoursNum = Math.floor(remainder/3600)
      hours = String(hoursNum)
      minutes = String(Math.floor((remainder % hoursNum)/60))
    } else {
      // Less than 1 day
      remainder = timerTimeToWait
      hoursNum = Math.floor(remainder/3600)
      hours = String(hoursNum)
    }

    if (hoursNum != 0) {
      minutes = String(Math.floor((remainder % hoursNum)/60))
    } else {
      // Less than 1 hour
      minutes = String(Math.floor(remainder/60))
    }

    if (hours.length < 2) { hours = '0'+hours }
    if (minutes.length < 2) { minutes = '0'+minutes }
    return hours+':'+minutes
  }

  updateDaysTimerTimeToWait = (timerTimeToWait: number, days: number) => {
    const previousDays = Math.floor(timerTimeToWait/86400)
    let remainder

    if (previousDays !== 0) { remainder = timerTimeToWait % 86400 }
    else { remainder = timerTimeToWait }

    let updatedTimerTimeToWait
    if (days != 0) {
      updatedTimerTimeToWait = 86400*days + remainder
    } else {
      updatedTimerTimeToWait = remainder
    }
    this.props.updateAlarmKey('timerTimeToWait', updatedTimerTimeToWait)
  }

  updateTimeTimerTimeToWait = (timerTimeToWait: number, time: string) => {
    const hoursAsSeconds = +time.slice(0,2)*60*60
    const minutesAsSeconds = +time.slice(3,5)*60
    const remainder = hoursAsSeconds+minutesAsSeconds

    const days = Math.floor(timerTimeToWait/86400)
    const updatedTimerTimeToWait = (days === 0) ? remainder : (86400*days + remainder)
    this.props.updateAlarmKey('timerTimeToWait', updatedTimerTimeToWait)
  }

  // Stopwatch
  setStopwatch = () => {
    const { defaults } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setStopwatch({
      alarmType: 'stopwatch', description: defaults.descStopwatch, alarmState: 'disabled',
      stopwatchTotalTime: 0,
    })
    this.props.updateAlarmInstance(alarm)
  }

  render() {
    const { alarm, currentTime, addSecondsToNow } = this.props
    const { alarmType } = alarm
    return (
      <div className="edit-container">
        <div className="alarm-type padding-controls">
          <div className={"alarm-type-alarm btn-padding"
            +(alarmType==='alarm'?' active':'')}
            onClick={() => this.setAlarm()}>Alarm</div>

          <div className={"alarm-type-timer btn-padding"
            +(alarmType==='timer'?' active':'')}
            onClick={() => this.setTimer()}>Timer</div>

          <div className={"alarm-type-stopwatch btn-padding btn-last"
            +(alarmType==='stopwatch'?' active':'')}
            onClick={() => this.setStopwatch()}>Stopwatch</div>
        </div>

        <div className="edit__section padding">
          <div className="edit__block">Description</div>

          <input type="text" autoComplete="off" className="" value={alarm.description}
            onChange={e => this.props.updateAlarmKey('description', e.target.value)} />
        </div>


        {/* Alarm */}
        {alarmType === 'alarm' &&
        <div className="edit__section padding">
          <div className="edit__block">Alarm time:</div>

          <DatePicker value={alarm.timeToActivate.toLocalISOString()}
            showClearButton={false}
            onChange={(value: string) =>
              this.updateDate('timeToActivate', alarm.timeToActivate, value)} />

          <TimeField
            value={this.getTimeFromDate(alarm.timeToActivate)}
            onChange={(value: string) =>
              this.updateTime('timeToActivate', alarm.timeToActivate, value)}
            input={<input className='edit__time-input' autoComplete="off" />}
          />

          <div className="edit__block">Repeat: {this.getRepeatString()}</div>
          <div className="edit__block">{this.weekJSX(alarm.repeatDaysOfWeek, alarm.repeatType)}</div>
          <div className="edit__block">
            <input type="checkbox" id="repeat-type" checked={alarm.repeatType === 'countdown'}
              onChange={() => this.updateRepeatType(true)} />
            <label htmlFor="repeat-type">Every</label>

            <input type="number" min="1" max="10000" value={alarm.repeatCountdown}
              onChange={e => {
                if (+e.target.value >= +e.target.min && +e.target.value <= +e.target.max) {
                  this.props.updateAlarmKey('repeatCountdown', +e.target.value)
              }}}
            />

            <div className="edit__inline-text">day from</div>

            <DatePicker value={alarm.repeatFrom.toLocalISOString()} showClearButton={false}
              onChange={(value: string) =>
                this.updateDate('repeatFrom', alarm.repeatFrom, value)} />
          </div>
        </div>}


        {/* Timer */}
        {alarmType === 'timer' &&
        <div className="edit__section padding">
          <div className="edit__block">Time from: {alarm.timerTimeFrom ?
            this.getDateStringFromDate(alarm.timerTimeFrom) :
            this.getDateStringFromDate(currentTime)}
          </div>
          <div className="edit__block">Time to wait:</div>

          <input type="number" min="0" max="10000"
            value={this.getDaysTimerTimeToWait(alarm.timerTimeToWait)}
            onChange={e => {
              if (+e.target.value >= +e.target.min && +e.target.value <= +e.target.max) {
                // do not allow to set 0 days when time === '00:00'
                if (e.target.value === '0' &&
                  this.getTimeTimerTimeToWait(alarm.timerTimeToWait) === '00:00') return;
                this.updateDaysTimerTimeToWait(alarm.timerTimeToWait, +e.target.value)
            }}}
          />

          <div className="edit__block">D</div>

          <TimeField
            value={this.getTimeTimerTimeToWait(alarm.timerTimeToWait)}
            onChange={(value: string) => {
              this.updateTimeTimerTimeToWait(alarm.timerTimeToWait, value)
            }}
            input={<input className='edit__time-input' autoComplete="off" />}
          />

          <div className="edit__block">Timer will activate: {
            this.getDateStringFromDate(addSecondsToNow(alarm.timerTimeToWaitCountdown))}</div>

          <div className="edit__block">
            <input type="checkbox" id="repeat-timer"
              checked={alarm.repeatType === 'timer'}
              onChange={() => {
                if (alarm.repeatType !== 'timer') {
                  this.props.updateAlarmKey('repeatType', 'timer')
                } else {
                  this.props.updateAlarmKey('repeatType', 'once')
                }
              }}
            />
            <label htmlFor="repeat-timer">Auto restart timer</label>
          </div>
        </div>}


        {/* Stopwatch */}
        {alarmType === 'stopwatch' &&
        <div className="edit__section padding">
          <div className="edit__block">Current time:</div>
          <div className="edit__block">{this.getDateStringFromDate(currentTime)}</div>

          <div className="edit__block">First activation time:</div>
          <div className="edit__block">{alarm.stopwatchTimeFrom ?
            this.getDateStringFromDate(alarm.stopwatchTimeFrom) :
            'Stopwatch has not been activated'}
          </div>

          <div className="edit__block">Total time:</div>
          <div className="edit__block">
            {this.props.toDDHHmmss(alarm.stopwatchTotalTime, alarmType)}
          </div>
        </div>}


        {/* Sound */}
        {(alarmType === 'alarm' || alarmType === 'timer') &&
        <div className="edit__section">
          <div className="edit__block">
            <input type="checkbox" id="play-sound" checked={alarm.playSound}
              onChange={() => this.props.updateAlarmKey('playSound', !alarm.playSound)} />
            <label htmlFor="play-sound">Play sound</label>
          </div>

          <div className="edit__block">
          </div>

          <div className="edit__block">
            <input type="checkbox" id="repeat-sound" checked={alarm.repeatSound}
              onChange={() => this.props.updateAlarmKey('repeatSound', !alarm.repeatSound)} />
            <label htmlFor="repeat-sound">Repeat sound</label>
          </div>
        </div>}


        {/* Command */}
        {(alarmType === 'alarm' || alarmType === 'timer') &&
        <div className="edit__section padding">
          <div className="edit__block">
            <input type="checkbox" id="start-application" checked={alarm.startApplication}
              onChange={() => this.props.updateAlarmKey('startApplication', !alarm.startApplication)} />
            <label htmlFor="start-application">Start application</label>
          </div>

          <div className="edit__block">
            <input type="checkbox" id="auto-stop-alarm" checked={alarm.autoStopAlarm}
              onChange={() => this.props.updateAlarmKey('autoStopAlarm', !alarm.autoStopAlarm)} />
            <label htmlFor="auto-stop-alarm">Stop alarm automatically</label>
          </div>

          <div className="edit__block">Command</div>
          <input type="text" autoComplete="off" className="" value={alarm.applicationCommand}
            onChange={(e) => this.props.updateAlarmKey('applicationCommand', e.target.value)} />
        </div>}


        {(alarmType === 'timer' || alarmType === 'stopwatch') &&
        <div className="edit__section-row padding">

          {(alarm.alarmState === 'enabled' && alarmType === 'timer') &&
          <div className="edit__btn reset"
            onClick={() => this.props.runCustomAlarmHandler('resetTimer', [true])}></div>}

          {(alarm.alarmState === 'enabled' && alarmType === 'stopwatch') &&
          <div className="edit__btn reset"
            onClick={() => this.props.runCustomAlarmHandler('resetStopwatch')}></div>}

          <div className={"edit__btn "+
            this.props.getAlarmHandlerClass(alarm.alarmState)}
            onClick={() => this.props.runAlarmHandler(alarmType, alarm.alarmState)}></div>
        </div>}
      </div>
    )
  }
}
