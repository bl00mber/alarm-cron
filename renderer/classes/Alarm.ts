/*
 * Copyright Nick Reiley <bloomber111@gmail.com>

 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

import { AlarmFields, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

export default class Alarm implements AlarmFields {
  [key: string]: any;

  alarmType: AlarmType | undefined;
  description: string | undefined;
  alarmState: AlarmStateType | undefined;

  timeToActivate: Date | undefined;        // Alarm
  repeatType: RepeatType | undefined;      // Alarm
  repeatDaysOfWeek: Week | undefined;      // Alarm
  repeatCountdown: number | undefined;     // Alarm
  playSound: boolean | undefined;          // Alarm | Timer
  soundPath: string | undefined;           // Alarm | Timer
  repeatSound: boolean | undefined;        // Alarm | Timer
  startApplication: boolean | undefined;   // Alarm | Timer
  autoStopAlarm: boolean | undefined;      // Alarm | Timer
  applicationCommand: string | undefined;  // Alarm | Timer

  timerTimeFrom: Date | undefined;         // Timer
  timerTimeToWait: number | undefined;     // Timer

  stopwatchTimeFrom: Date | undefined;     // Stopwatch
  stopwatchTotalTime: number | undefined;  // Stopwatch

  /**
   * Instances of Alarm are not intended to be used as immutable structures but
   * rather within object-oriented approach.
   * By default class instances implements enabled Alarm.
   */
  constructor({
    alarmType, description, alarmState, timeToActivate,
    repeatType, repeatDaysOfWeek, repeatCountdown,
    playSound, soundPath, repeatSound,
    startApplication, autoStopAlarm, applicationCommand
  }: {
    alarmType: AlarmType, description: string,
    alarmState: AlarmStateType, timeToActivate: Date,
    repeatType: RepeatType, repeatDaysOfWeek: Week, repeatCountdown: number,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, autoStopAlarm: boolean, applicationCommand: string
  }) {
    Object.assign(
      this, arguments[0]
    )
    this.setAlarm.bind(this)
    this.setTimer.bind(this)
    this.setStopwatch.bind(this)
  }

  setAlarm ({
    alarmType, description, alarmState
  }: {
    alarmType: AlarmType, description: string, alarmState: AlarmStateType
  }) {
    Object.assign(
      this, arguments[0]
    )
  }

  setTimer ({
    alarmType, description, alarmState,
    timerTimeFrom, timerTimeToWait
  }: {
    alarmType: AlarmType, description: string, alarmState: AlarmStateType,
    timerTimeFrom: Date, timerTimeToWait: number
  }) {
    Object.assign(
      this, arguments[0]
    )
  }

  setStopwatch ({
    alarmType, description, alarmState,
    stopwatchTimeFrom, stopwatchTotalTime
  }: {
    alarmType: AlarmType, description: string, alarmState: AlarmStateType,
    stopwatchTimeFrom: Date, stopwatchTotalTime: number
  }) {
    Object.assign(
      this, arguments[0]
    )
  }

  activateTimer = () => {

  }

  activateStopwatch = () => {

  }
}
