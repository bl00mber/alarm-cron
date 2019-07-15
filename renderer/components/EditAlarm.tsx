/*
Copyright (c) Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import { remote } from 'electron'

import * as React from 'react'
import { cloneDeep, capitalize } from 'lodash'
// @ts-ignore
import DatePicker from 'react-bootstrap-date-picker'
import Dropdown from 'react-dropdown'
// @ts-ignore
import TimeField from 'react-simple-timefield'
import Alarm from '../../classes/Alarm'
import { AlarmType, AlarmStateType, RepeatType, Week, SettingsFields } from '../../types/alarm'

import '../styles/EditAlarm.scss'
import '../styles/react-bootstrap-date-picker.css'

interface Props {
  alarm: Alarm,
  settings: SettingsFields,
  currentTime: Date,

  stopPlayerAndCheckForActive: () => void,
  updateAlarmKey: (key: string, value: any, callback?: () => any) => void,
  updateAlarmInstance: (alarm: Alarm, alarmIndex?: number, callback?: () => any) => void,
  addSecondsToNow: (seconds: number, floorSeconds: boolean) => Date,
  toDDHHmmss: (seconds: number, alarmType: AlarmType) => string,
  runAlarmHandler: (alarmType: AlarmType, alarmState: AlarmStateType, alarmIndex?: number) => void,
  runCustomAlarmHandler: (handlerKey: string, args?: any[], alarmIndex?: number) => void,
  getAlarmHandlerClass: (alarmState: AlarmStateType) => string,
  getAlarmHandlerImage: (alarmState: AlarmStateType) => string,
}

interface State {
  cursorOverCalendar: boolean,
}

export default class EditAlarm extends React.Component<Props, State> {
  state = {
    cursorOverCalendar: false,
  }

  // disable rerender when cursor is over calendar to
  // prevent calendar close when time is updated
  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (nextState.cursorOverCalendar) return false
    return true
  }

  localToGlobalISOString = (localISOString: string): string => {
    const dateUTC = new Date(localISOString)
    const tzo = -dateUTC.getTimezoneOffset()
    const dateLocal = new Date((dateUTC.getTime()/1000 + tzo*60)*1000)
    return dateLocal.toISOString()
  }

  // Alarm
  setAlarm = () => {
    const { settings } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setAlarm({
      description: settings.descAlarm, alarmState: 'disabled',
    })
    this.props.updateAlarmInstance(alarm)
  }

  /**
   * Method with localISO -> globalISO conversion
   * oldValue: globalISOString
   * value: localISOString -> globalISOString
   * newValue: value, oldValue
  **/
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
            if (weekStr.length > 0) { weekStr = weekStr+', '+capitalize(key) }
            else { weekStr += capitalize(key) }
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

  weekJSX = (_week: Week, repeatType: RepeatType): React.ReactElement<{}>[] => {
    const weekJSX: React.ReactElement<{}>[] = []

    const week: Week = {'mon': _week.mon, 'tue': _week.tue, 'wed': _week.wed,
      'thu': _week.thu, 'fri': _week.fri, 'sat': _week.sat, 'sun': _week.sun}

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
        <label htmlFor={"alarm_"+key}>{capitalize(key)}</label>
      </div>)
    }
    return weekJSX
  }

  // Timer
  // Remainder is a seconds remainder from overall time divided by days
  setTimer = () => {
    const { settings } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setTimer({
      description: settings.descTimer, alarmState: 'disabled',
      timerTimeToWait: alarm.timerTimeToWait || settings.timerTimeToWait,
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
    this.props.updateAlarmKey('timerTimeToWaitCountdown', updatedTimerTimeToWait)
  }

  updateTimeTimerTimeToWait = (timerTimeToWait: number, time: string) => {
    const hoursAsSeconds = +time.slice(0,2)*60*60
    const minutesAsSeconds = +time.slice(3,5)*60
    const remainder = hoursAsSeconds+minutesAsSeconds

    const days = Math.floor(timerTimeToWait/86400)
    const updatedTimerTimeToWait = (days === 0) ? remainder : (86400*days + remainder)
    this.props.updateAlarmKey('timerTimeToWait', updatedTimerTimeToWait)
    this.props.updateAlarmKey('timerTimeToWaitCountdown', updatedTimerTimeToWait)
  }

  // Stopwatch
  setStopwatch = () => {
    const { settings } = this.props
    const alarm = cloneDeep(this.props.alarm)
    alarm.setStopwatch({
      description: settings.descStopwatch, alarmState: 'disabled',
      stopwatchTotalTime: 0,
    })
    this.props.updateAlarmInstance(alarm)
  }

  render () {
    const { alarm, settings, currentTime } = this.props
    const { stopPlayerAndCheckForActive, addSecondsToNow } = this.props
    const { alarmType, alarmState } = alarm
    return (
      <div className="edit-controls-container">
        <div className="alarm-type padding-controls">
          <div className={"alarm-type-alarm btn-padding"
            +(alarmType==='alarm'?' active':'')}
            onClick={() => {
              alarmType !== 'alarm' && this.setAlarm()
            }}>Alarm</div>

          <div className={"alarm-type-timer btn-padding"
            +(alarmType==='timer'?' active':'')}
            onClick={() => {
              alarmType !== 'timer' && this.setTimer()
            }}>Timer</div>

          <div className={"alarm-type-stopwatch btn-padding btn-last"
            +(alarmType==='stopwatch'?' active':'')}
            onClick={() => {
              alarmType !== 'stopwatch' && this.setStopwatch()
            }}>Stopwatch</div>
        </div>

        <div className="edit__section padding">
          <div className="edit__block margin-bottom">Description</div>

          <input type="text" autoComplete="off" className="margin-bottom"
            value={alarm.description}
            onChange={e => this.props.updateAlarmKey('description', e.target.value)} />
        </div>


        {/* Alarm */}
        {alarmType === 'alarm' &&
        <div className="edit__section padding">
          <div className="edit__block margin-bottom">Alarm time</div>

          <div className="edit__block margin-bottom">
            <DatePicker
              value={alarm.timeToActivate.toLocalISOString()}
              className="datepicker margin-right"
              showClearButton={false}
              onChange={(value: string) =>
                this.updateDate('timeToActivate', alarm.timeToActivate, value)}
              onFocus={() => this.setState({ cursorOverCalendar: true })}
              onBlur={() => this.setState({ cursorOverCalendar: false })}
            />

            <TimeField
              value={this.getTimeFromDate(alarm.timeToActivate)}
              className="timepicker"
              onChange={(value: string) =>
                this.updateTime('timeToActivate', alarm.timeToActivate, value)}
              input={<input className="edit__time-input" autoComplete="off" />}
            />
          </div>

          <div className="edit__block margin-bottom">Repeat: {this.getRepeatString()}</div>
          <div className="edit__block">{this.weekJSX(alarm.repeatDaysOfWeek, alarm.repeatType)}</div>
          <div className="edit__block align-center">
            <input type="checkbox" id="repeat-type" checked={alarm.repeatType === 'countdown'}
              onChange={() => this.updateRepeatType(true)} />
            <label htmlFor="repeat-type"
              className="margin-right">Every</label>

            <input type="number" min="1" max="10000"
              className="daypicker margin-right"
              value={alarm.repeatCountdown}
              onChange={e => {
                if (+e.target.value >= +e.target.min && +e.target.value <= +e.target.max) {
                  this.props.updateAlarmKey('repeatCountdown', +e.target.value)
              }}}
            />

            <div className="edit__inline-text margin-right">day from</div>

            <DatePicker
              value={alarm.repeatFrom.toLocalISOString()}
              className="datepicker moved"
              showClearButton={false}
              onChange={(value: string) =>
                this.updateDate('repeatFrom', alarm.repeatFrom, value)}
              onFocus={() => this.setState({ cursorOverCalendar: true })}
              onBlur={() => this.setState({ cursorOverCalendar: false })}
            />
          </div>
        </div>}


        {/* Timer */}
        {alarmType === 'timer' &&
        <div className="edit__section padding">
          <div className="edit__block margin-bottom">Time from: {alarm.timerTimeFrom ?
            this.getDateStringFromDate(alarm.timerTimeFrom) :
            this.getDateStringFromDate(currentTime)}
          </div>
          <div className="edit__block margin-bottom">Time to wait</div>

          <div className="edit__block align-center margin-bottom">
            <input type="number" min="0" max="10000"
              className="daypicker margin-right"
              value={this.getDaysTimerTimeToWait(alarm.timerTimeToWait)}
              onChange={e => {
                if (+e.target.value >= +e.target.min && +e.target.value <= +e.target.max) {
                  // do not allow to set 0 days when time === '00:00'
                  if (e.target.value === '0' &&
                    this.getTimeTimerTimeToWait(alarm.timerTimeToWait) === '00:00') return;
                  this.updateDaysTimerTimeToWait(alarm.timerTimeToWait, +e.target.value)
              }}}
            />

            <div className="edit__block margin-right">D</div>

            <TimeField
              value={this.getTimeTimerTimeToWait(alarm.timerTimeToWait)}
              className="timepicker"
              onChange={(value: string) => {
                this.updateTimeTimerTimeToWait(alarm.timerTimeToWait, value)
              }}
              input={<input className="edit__time-input" autoComplete="off" />}
            />
          </div>

          <div className="edit__block">Timer will activate: {
            this.getDateStringFromDate(addSecondsToNow(alarm.timerTimeToWaitCountdown,
              settings.floorSeconds))}</div>

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
          <div className="edit__block margin-bottom">Current time: {this.getDateStringFromDate(currentTime)}</div>

          <div className="edit__block margin-bottom">Activation time: {alarm.stopwatchTimeFrom ?
            this.getDateStringFromDate(alarm.stopwatchTimeFrom) :
            'hasn\'t been activated'}</div>

          <div className="edit__block margin-bottom">Total time: {this.props.toDDHHmmss(alarm.stopwatchTotalTime, alarmType)}</div>
        </div>}


        {/* Sound */}
        {(alarmType === 'alarm' || alarmType === 'timer') &&
        <div className="edit__section padding margin-bottom">
          <div className="edit__block">
            <input type="checkbox" id="play-sound" checked={alarm.playSound}
              disabled={alarm.autoStopAlarm}
              onChange={() => this.props.updateAlarmKey('playSound', !alarm.playSound)} />
            <label htmlFor="play-sound">Play sound</label>

            <input type="checkbox" id="repeat-sound" checked={alarm.repeatSound}
              disabled={alarm.autoStopAlarm}
              onChange={() => this.props.updateAlarmKey('repeatSound', !alarm.repeatSound)} />
            <label htmlFor="repeat-sound">Repeat sound</label>
          </div>

          <div className="edit__block">
            <div className="sound-upload">
              <div className="sound-btn">Select sound</div>
              <input type="file" name="sound-file" accept="audio/mp3"
                onChange={e => {
                  e.preventDefault()
                  const newSoundPath = e.target.files[0].path
                  this.props.updateAlarmKey('soundPath', newSoundPath)
                }} />

              <Dropdown className="sound-path"
                options={['default', 'Train-Station-Street', 'Train-Station-Vietnam', 'Evacuation-Test-Japan', 'Telemetry-Tech-Data-23']}
                onChange={e => {
                  this.props.updateAlarmKey('soundPath', remote.app.getAppPath()+'/resources/'+e.value+'.mp3')
                }}
                value={alarm.soundPath.split('/').pop() || settings.soundPath.split('/').pop()}
              />
            </div>
          </div>
        </div>}


        {/* Command */}
        {(alarmType === 'alarm' || alarmType === 'timer') &&
        <div className="edit__section padding">
          <div className="edit__block">
            <input type="checkbox" id="start-application" checked={alarm.startApplication}
              onChange={() => this.props.updateAlarmKey('startApplication', !alarm.startApplication)} />
            <label htmlFor="start-application">Start application</label>

            <input type="checkbox" id="auto-stop-alarm" checked={alarm.autoStopAlarm}
              onChange={() => this.props.updateAlarmKey('autoStopAlarm', !alarm.autoStopAlarm)} />
            <label htmlFor="auto-stop-alarm">Stop alarm automatically</label>
          </div>

          <div className="edit__block margin-bottom">Command</div>
          <input type="text" autoComplete="off" className="margin-bottom"
            disabled={!alarm.startApplication}
            value={alarm.applicationCommand}
            onChange={(e) => this.props.updateAlarmKey('applicationCommand', e.target.value)} />
        </div>}


        {(alarmType === 'timer' || alarmType === 'stopwatch') &&
        <div className="edit__section padding">
          <div className="edit__block">
            <div className={"edit__btn " +
              ((alarmState !== 'disabled' || (alarmType === 'stopwatch' && Boolean(alarm.stopwatchTotalTime))) ? 'margin-right ' : '') +
              this.props.getAlarmHandlerClass(alarmState)}

              onClick={() => {
                if (alarmState === 'active') stopPlayerAndCheckForActive()
                this.props.runAlarmHandler(alarmType, alarmState)
              }}>
              <div className="alarm-handler__btn-img"
                style={{backgroundImage: this.props.getAlarmHandlerImage(alarmState)}}></div>
            </div>

            {(alarmState === 'enabled' && alarmType === 'timer') &&
            <div className="edit__btn reset"
              onClick={() => this.props.runCustomAlarmHandler('resetTimer', [true])}>

              <div className="alarm-handler__btn-img"
                style={{backgroundImage: this.props.getAlarmHandlerImage('active')}}></div>
            </div>}

            {(alarmType === 'stopwatch') && (alarmState === 'enabled' || Boolean(alarm.stopwatchTotalTime)) &&
            <div className="edit__btn reset"
              onClick={() => this.props.runCustomAlarmHandler('resetStopwatch')}>

              <div className="alarm-handler__btn-img"
                style={{backgroundImage: this.props.getAlarmHandlerImage('active')}}></div>
            </div>}
          </div>
        </div>}
      </div>
    )
  }
}
