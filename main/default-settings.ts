import { app } from 'electron'
import { SettingsFields } from '../types/alarm'

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
  soundPath: app.getAppPath()+'/resources/default.mp3',
  repeatSound: true,
  startApplication: false,
  autoStopAlarm: false,
  applicationCommand: '',

  timerTimeToWait: 600,
  stopwatchTotalTime: 0,

  postponeOffset: 300,
  autoStopAfterMMIsActive: true,
  autoStopAfterMM: 10,
  showNotification: true,
  trayMonoIcon: false,

  listWidthPx: 330,
  listHeightPx: 552,
  editWidthPx: 380,
  editHeightPx: 622,
}
