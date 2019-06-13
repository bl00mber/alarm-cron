import { app } from 'electron'
import { SettingsFields } from '../types/alarm'

let soundPath

if (process.env.NODE_ENV === 'production') {
  soundPath = app.getAppPath()+'/resources/default.mp3'
} else {
  soundPath = app.getAppPath()+'/assets/sounds/default.mp3'
}

export const defaultSettings: SettingsFields = {
  alarmType: 'alarm',
  descAlarm: 'Alarm',
  descTimer: 'Timer',
  descStopwatch: 'Stopwatch',
  alarmState: 'enabled',

  timeToActivateOffset: 600,
  floorSeconds: false,
  repeatType: 'once',
  repeatDaysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
  repeatCountdown: 1,
  playSound: true,
  soundPath,
  repeatSound: true,
  startApplication: false,
  autoStopAlarm: false,
  applicationCommand: '',

  timerTimeToWait: 600,
  stopwatchTotalTime: 0,

  postponeOffset: 300,
  autoStopAfterMMIsActive: true,
  autoStopAfterMM: 10,

  listWidthPx: 330,
  listHeightPx: 552,
  editWidthPx: 380,
  editHeightPx: 622,
}
