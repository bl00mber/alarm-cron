/*
 * Copyright Nick Reiley <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import * as React from 'react'
import Alarm from '../classes/Alarm'
// @ts-ignore
import DatePicker from 'react-bootstrap-date-picker'
// @ts-ignore
import TimeField from 'react-simple-timefield'

import '../style/EditAlarm.scss'

interface State {
  edit: string,
  currentTime: Date,
  alarm: Alarm,
}

export default class EditAlarm extends React.Component<any, State> {
  currentTimeInterval: NodeJS.Timeout;

  constructor(props: any) {
    super(props)
    this.state = {
      edit: props.alarm.alarmType,
      currentTime: new Date(),
      alarm: props.alarm,
    }
  }

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    return {
      alarm: nextProps.alarm,
    }
  }

  componentDidMount() {
    // this.currentTimeInterval = setInterval(() => this.setState({ currentTime: new Date() }), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.currentTimeInterval)
  }

  updateAlarm = (key: string, value: any) => {
    const { alarm } = this.state
    alarm[key] = value
    this.setState({ alarm: alarm })
  }

  // Alarm
  setAlarm = () => {
    this.state.alarm.setAlarm({
      alarmType: 'timer', alarmState: 'disabled',
    })
    this.setState({edit: 'alarm'})
  }

  updateDate = (alarmKey: string, value: Date) => {

  }

  updateTime = (alarmKey: string, value: string) => {

  }

  updateDays = (alarmKey: string, value: string) => {

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

  }

  weekJSX = (): React.ReactElement<{}> => {

  }

  // Timer
  setTimer = () => {
    const { alarm } = this.state
    const { defAl } = this.props
    alarm.setTimer({
      alarmType: 'timer', alarmState: 'disabled',
      timerTimeFrom: alarm.timerTimeFrom || new Date(),
      timerTimeToWait: alarm.timerTimeToWait || defAl.timerTimeToWait,
    })
    this.setState({edit: 'timer'})
  }

  getDaysFromNowToTimeToWait (timeToWait: number): number { // DD
    return Math.floor(timeToWait / 86400)
  }

  addSecondsFromTimeToWaitToNow (timeToWait: number) {

  }

  // Stopwatch
  setStopwatch = () => {
    const { alarm } = this.state
    const { defAl } = this.props
    alarm.setStopwatch({
      alarmType: 'stopwatch', alarmState: 'disabled',
      stopwatchTimeFrom: alarm.stopwatchTimeFrom || new Date(),
      stopwatchTotalTime: alarm.stopwatchTotalTime || 0,
    })
    this.setState({edit: 'stopwatch'})
  }

  render() {
    const { edit, currentTime, alarm } = this.state
    console.log('CURRENTTIME', currentTime)
    console.log('ALARM', alarm)
    return (
      <div className="edit-container">
        <div className="alarm-type padding">
          <div className={"alarm-type-alarm btn-padding"
            +(edit==='alarm'?' active':'')}
            onClick={() => this.setAlarm()}>Alarm</div>

          <div className={"alarm-type-timer btn-padding"
            +(edit==='timer'?' active':'')}
            onClick={() => this.setTimer()}>Timer</div>

          <div className={"alarm-type-stopwatch btn-padding btn-last"
            +(edit==='stopwatch'?' active':'')}
            onClick={() => this.setStopwatch()}>Stopwatch</div>
        </div>


        {/* Alarm */}
        {edit === 'alarm' &&
        <div className="edit__section padding">
          <div className="edit__block">Description</div>

          <input type="text" autoComplete="off" className="" value={alarm.description}
            onChange={e => this.updateAlarm('description', e.target.value)} />

          <div className="edit__block">Alarm time</div>

          <DatePicker value={alarm.timeToActivate.toLocalISOString()} showClearButton={false}
            onChange={(value: Date) => this.updateDate('timeToActivate', value)} />

          <TimeField
            value={this.getTimeFromDate(alarm.timeToActivate)}
            onChange={(value: string) => this.updateTime('timeToActivate', value)}
            input={<input className='edit__time-input' autoComplete="off" />}
          />

          <div className="edit__block">Repeat: {this.getRepeatString()}</div>
          <div className="edit__block">{this.weekJSX()}</div>
          <div className="edit__block">
            <input type="checkbox" id="repeat-type" checked={alarm.repeatType === 'countdown'}
              onChange={() => this.updateAlarm('repeatType', 'countdown')} />
            <label htmlFor="repeat-type">Every</label>

            <input type="number" min="1" max="10000" value={alarm.repeatCountdown}
              onChange={e => this.updateAlarm('repeatCountdown', e.target.value)} />
            <div className="edit__inline-text">day from</div>

            {this.getDateFromDate(alarm.timeToActivate)}
          </div>
        </div>}


        {/* Timer */}
        {edit === 'timer' &&
        <div className="edit__section padding">
          <div className="edit__block">Time to wait</div>

          <input type="number" min="0" max="10000"
            value={this.getDaysFromNowToTimeToWait(alarm.timerTimeToWait)}
            onChange={e => this.updateDays('timerTimeToWait', e.target.value)} />

          <TimeField
            value={this.getTimeFromDate(alarm.timeToActivate)}
            onChange={(value: string) => this.updateTime('timerTimeToWait', value)}
            input={<input className='edit__time-input' autoComplete="off" />}
          />

          <div className="edit__block">Timer will activate: {
            this.addSecondsFromTimeToWaitToNow(alarm.timerTimeToWait)}</div>
        </div>}


        {/* Stopwatch */}
        {edit === 'stopwatch' &&
        <div className="edit__section padding">
          <div className="edit__block">Current time is:</div>
          <div className="edit__block">{this.getDateStringFromDate(currentTime)}</div>

          <div className="edit__inline-text">Enable stopwatch</div>
        </div>}


        {/* Sound */}
        {(edit === 'alarm' || edit === 'timer') &&
        <div className="edit__section">
          <div className="edit__block">
            <input type="checkbox" id="play-sound" checked={alarm.playSound}
              onChange={() => this.updateAlarm('playSound', !alarm.playSound)} />
            <label htmlFor="play-sound">Play sound</label>
          </div>

          <div className="edit__block">
          </div>

          <div className="edit__block">
            <input type="checkbox" id="repeat-sound" checked={alarm.repeatSound}
              onChange={() => this.updateAlarm('repeatSound', !alarm.repeatSound)} />
            <label htmlFor="repeat-sound">Repeat sound</label>
          </div>
        </div>}


        {/* Command */}
        {(edit === 'alarm' || edit === 'timer') &&
        <div className="edit__section padding">
          <div className="edit__block">
            <input type="checkbox" id="start-application" checked={alarm.startApplication}
              onChange={() => this.updateAlarm('startApplication', !alarm.startApplication)} />
            <label htmlFor="start-application">Start application</label>
          </div>

          <div className="edit__block">
            <input type="checkbox" id="auto-stop-alarm" checked={alarm.autoStopAlarm}
              onChange={() => this.updateAlarm('autoStopAlarm', !alarm.autoStopAlarm)} />
            <label htmlFor="auto-stop-alarm">Stop alarm automatically</label>
          </div>

          <div className="edit__block">Command</div>
          <div className="edit__block">
          </div>
        </div>}
      </div>
    )
  }
}
