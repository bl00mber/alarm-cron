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

import { cloneDeep } from 'lodash'
import { AlarmFields, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

export default class Alarm implements AlarmFields {
  /**
   * @prop timeOfActivation settings.autoStopAfterMM can be expired if calculated from
   * timeToActivate if app platform was turned off during alarm activation, so this date
   * ensures that alarm will ring for specified time length as it supposed to
   * @prop timerTimeToWait restore timer value that has been set by user in particular alarm
   * @prop timerTimeToWaitCountdown countdown active timer
  **/
  [key: string]: any;

  alarmType: AlarmType | undefined;
  description: string | undefined;
  alarmState: AlarmStateType | undefined;

  timeToActivate: Date | undefined;        // Alarm
  timeOfActivation: Date | undefined;      // Alarm
  repeatType: RepeatType | undefined;      // Alarm
  repeatDaysOfWeek: Week | undefined;      // Alarm
  repeatCountdown: number | undefined;     // Alarm
  repeatFrom: Date | undefined;            // Alarm

  playSound: boolean | undefined;          // Alarm | Timer
  soundPath: string | undefined;           // Alarm | Timer
  repeatSound: boolean | undefined;        // Alarm | Timer
  startApplication: boolean | undefined;   // Alarm | Timer
  autoStopAlarm: boolean | undefined;      // Alarm | Timer
  applicationCommand: string | undefined;  // Alarm | Timer

  timerTimeFrom: Date | undefined;         // Timer
  timerTimeToWait: number | undefined;     // Timer
  timerTimeToWaitCountdown: number | undefined; // Timer

  stopwatchTimeFrom: Date | undefined;     // Stopwatch
  stopwatchTotalTime: number | undefined;  // Stopwatch

  /**
   * Initially class instances implements enabled Alarm
  **/
  constructor ({
    description, alarmState, timeToActivate,
    repeatType, repeatDaysOfWeek,
    repeatCountdown, repeatFrom,
    playSound, soundPath, repeatSound,
    startApplication, autoStopAlarm, applicationCommand
  }: {
    description: string, alarmState: AlarmStateType, timeToActivate: Date,
    repeatType: RepeatType, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, autoStopAlarm: boolean, applicationCommand: string
  }) {
    this.alarmType = 'alarm'
    Object.assign(
      this, arguments[0]
    )
    this.setAlarm.bind(this)
    this.setTimer.bind(this)
    this.setStopwatch.bind(this)

    this.enableAlarm.bind(this)
    this.enableTimer.bind(this)
    this.enableStopwatch.bind(this)

    this.pauseAlarm.bind(this)
    this.pauseStopwatch.bind(this)

    this.resetAlarm.bind(this)
    this.resetTimer.bind(this)
    this.resetStopwatch.bind(this)

    this.setNextCountdownDate.bind(this)
  }

  // Set
  setAlarm ({
    description, alarmState
  }: {
    description: string, alarmState: AlarmStateType
  }) {
    this.alarmType = 'alarm'
    this.repeatType ='once'
    this.repeatDaysOfWeek = {
      mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
    }
    Object.assign(
      this, arguments[0]
    )
  }

  setTimer ({
    description, alarmState, timerTimeToWait
  }: {
    description: string, alarmState: AlarmStateType, timerTimeToWait: number
  }) {
    this.alarmType = 'timer'
    this.timerTimeToWaitCountdown = timerTimeToWait
    Object.assign(
      this, arguments[0]
    )
  }

  setStopwatch ({
    description, alarmState, stopwatchTotalTime
  }: {
    description: string, alarmState: AlarmStateType, stopwatchTotalTime: number
  }) {
    this.alarmType = 'stopwatch'
    this.stopwatchTimeFrom = undefined
    Object.assign(
      this, arguments[0]
    )
  }


  /**
   * Enable
   * Expired alarms can be enabled only if RepeatType !== 'once'
  **/
  enableAlarm () {
    if (this.alarmState !== 'disabled') return;
    if (new Date().getTime() > this.timeToActivate.getTime()) { // Expired
      if (this.repeatType === 'once') { return }
      else { this.setNextCountdownDate() }
    }
    this.alarmState = 'enabled'
  }

  // new Date() -> timerTimeFrom, if not set
  enableTimer () {
    if (this.alarmState !== 'disabled') return;
    if (this.timerTimeToWaitCountdown === 0) return; // Expired
    this.timerTimeFrom = new Date()
    this.alarmState = 'enabled'
  }

  // new Date() -> stopwatchTimeFrom, if not set
  enableStopwatch () {
    if (this.alarmState !== 'disabled') return;
    if (!this.stopwatchTimeFrom) this.stopwatchTimeFrom = new Date()
    this.alarmState = 'enabled'
  }


  /**
   * Pause
  **/
  pauseAlarm () {
    if (this.alarmState !== 'enabled') return;
    this.alarmState = 'disabled'
  }

  pauseTimer () {
    if (this.alarmState !== 'enabled') return;
    this.alarmState = 'disabled'
  }

  pauseStopwatch () {
    if (this.alarmState !== 'enabled') return;
    this.alarmState = 'disabled'
  }


  /**
   * Reset
   * Calculate next countdown point
   *   if returns date set new alarm
   *   if returns null set alarmState = 'disabled'
  **/
  resetAlarm () {
    if (this.repeatType !== 'once') {
      this.setNextCountdownDate()
      this.alarmState = 'enabled'
    }
    else {
      this.alarmState = 'disabled'
    }
  }

  resetTimer (ignoreAutoRestart?: boolean) {
    this.alarmState = 'disabled'
    this.timerTimeFrom = undefined
    this.timerTimeToWaitCountdown = this.timerTimeToWait
    if (this.repeatType === 'timer' && !ignoreAutoRestart) this.enableTimer()
  }

  resetStopwatch () {
    this.alarmState = 'disabled'
    this.stopwatchTimeFrom = undefined
    this.stopwatchTotalTime = 0
  }


  // Postpone
  postponeAlarm (offset: number) {
    this.timeToActivate = new Date((Math.floor(new Date().getTime()/1000)+offset)*1000)
    this.alarmState = 'enabled'
  }

  postponeTimer (offset: number) {
    this.timerTimeToWaitCountdown += offset
    this.alarmState = 'enabled'
  }


  /**
   * The logic is written for the case when
   * application platform is turned off for the long time
  **/
  setNextCountdownDate () {
    const hours = this.timeToActivate.getHours()
    const minutes = this.timeToActivate.getMinutes()

    if (this.repeatType === 'weekly') {
      const currentDateIndex = new Date().getDay()
      // days order according to js date interface
      const keys = ['sun','mon','tue','wed','thu','fri','sat']
      // fill firstDays in remainingDays by empty indices to prevent indices shift
      const remainingDays = [...keys].fill('', 0, currentDateIndex+1)
      const firstDays = keys.slice(0,currentDateIndex+1)

      let nextDayKey: string;
      let nextDayIndex: number;

      // firstly iterate remaining days of the week, not including current day
      for (const day of remainingDays) {
        if (this.repeatDaysOfWeek[day]) {
          nextDayKey = day
          break
        }
      }
      // then iterate first days of the week, including current day
      if (!nextDayKey) {
        for (const day of firstDays) {
          if (this.repeatDaysOfWeek[day]) {
            nextDayKey = day
            break
          }
        }
      }

      // find the nearest day
      remainingDays.forEach((day, index) => {
        if (day === nextDayKey) nextDayIndex = index
      })
      if (!nextDayIndex) firstDays.forEach((day, index) => {
        if (day === nextDayKey) nextDayIndex = index
      })

      // increment from current date until right day index of the week
      let increment = -1 // for the case when application platform being
      // rebooted after one week
      let nextDate: Date;

      function addIncrement() {
        increment += 1
        nextDate = new Date()
        nextDate.setHours(hours, minutes, 0)
        nextDate.setDate(nextDate.getDate()+increment)
        if (nextDate.getDay() != nextDayIndex) addIncrement()
      }
      addIncrement()
      this.timeToActivate = nextDate
    }

    else if (this.repeatType === 'countdown') {
      const repeatCountdown = this.repeatCountdown
      const currentTime = new Date().getTime()
      const repeatFrom = this.repeatFrom

      let nextDate = new Date(repeatFrom.getTime())
      nextDate.setHours(hours, minutes, 0)

      function addIncrement() {
        nextDate.addDays(repeatCountdown)
        if (currentTime > nextDate.getTime()) addIncrement()
      }
      addIncrement()
      this.timeToActivate = nextDate
    }
  }


  restoreFrom (alarmJSON: object) {
    for (let key in alarmJSON) {
      const dateKeys = [
        'timeToActivate', 'timeOfActivation', 'repeatFrom', 'timerTimeFrom', 'stopwatchTimeFrom'
      ]
      if (dateKeys.includes(key)) {
        // @ts-ignore
        this[key] = new Date(alarmJSON[key])
      } else {
        // @ts-ignore
        this[key] = alarmJSON[key]
      }
    }
  }
}
