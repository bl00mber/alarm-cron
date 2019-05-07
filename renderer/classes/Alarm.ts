import { AlarmInterface, AlarmType, AlarmStateType,
  RepeatType, Week } from '../types/alarm'

export default class Alarm implements AlarmInterface {
  /**
   * @param alarmType
   * @param description
   * @param alarmState
   * @param timeToActivate          | Alarm
   * @param repeatType              | Alarm
   * @param repeatDaysOfWeek        | Alarm
   * @param repeatCountdown         | Alarm
   * @param repeatFrom              | Alarm
   * @param playSound               | Alarm | Timer
   * @param soundPath               | Alarm | Timer
   * @param repeatSound             | Alarm | Timer
   * @param startApplication        | Alarm | Timer
   * @param applicationCommand      | Alarm | Timer
   * @param timerTimeFrom           | Timer
   * @param timerTimeToWait         | Timer
   * @param stopwatchTimeFrom       | Stopwatch
   * @param stopwatchTotalTime      | Stopwatch
   *
   * by default class instances implements Alarm
   * constructor assignment should be identical to createAlarm()
   */
  constructor({
    alarmType, description, alarmState, timeToActivate,
    repeatType, repeatDaysOfWeek, repeatCountdown, repeatFrom,
    playSound, soundPath, repeatSound,
    startApplication, applicationCommand
  }: {
    alarmType: AlarmType, description: string,
    alarmState: AlarmStateType, timeToActivate: Date,
    repeatType: RepeatType, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, applicationCommand: string
  }) {
    Object.assign(
      this, alarmType, description, alarmState, timeToActivate,
      repeatType, repeatDaysOfWeek,
      repeatCountdown, repeatFrom,
      playSound, soundPath, repeatSound,
      startApplication, applicationCommand
    )
  }

  _cleanAlarm = () => {
    this.alarmType = undefined
    this.description = undefined
    this.alarmState = undefined
    this.timeToActivate = undefined
    this.repeatType = undefined
    this.repeatDaysOfWeek = undefined
    this.repeatCountdown = undefined
    this.repeatFrom = undefined
    this.playSound = undefined
    this.soundPath = undefined
    this.repeatSound = undefined
    this.startApplication = undefined
    this.applicationCommand = undefined
    this.timerTimeFrom = undefined
    this.timerTimeToWait = undefined
    this.stopwatchTimeFrom = undefined
    this.stopwatchTotalTime = undefined
  }

  createAlarm({
    alarmType, description, alarmState, timeToActivate,
    repeatType, repeatDaysOfWeek, repeatCountdown, repeatFrom,
    playSound, soundPath, repeatSound,
    startApplication, applicationCommand
  }: {
    alarmType: AlarmType, description: string,
    alarmState: AlarmStateType, timeToActivate: Date,
    repeatType: RepeatType, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, applicationCommand: string
  }) {
    this._cleanAlarm()
    Object.assign(
      this, alarmType, description, alarmState, timeToActivate,
      repeatType, repeatDaysOfWeek,
      repeatCountdown, repeatFrom,
      playSound, soundPath, repeatSound,
      startApplication, applicationCommand
    )
  }

  createTimer({
    alarmType, description, alarmState,
    playSound, soundPath, repeatSound,
    startApplication, applicationCommand,
    timerTimeFrom, timerTimeToWait
  }: {
    alarmType: AlarmType, description: string, alarmState: AlarmStateType,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, applicationCommand: string,
    timerTimeFrom: Date, timerTimeToWait: number
  }) {
    this._cleanAlarm()
    Object.assign(
      this, alarmType, description, alarmState,
      playSound, soundPath, repeatSound,
      startApplication, applicationCommand,
      timerTimeFrom, timerTimeToWait,
    )
  }

  createStopwatch({
    alarmType, description, alarmState,
    stopwatchTimeFrom, stopwatchTotalTime
  }: {
    alarmType: AlarmType, description: string, alarmState: AlarmStateType,
    stopwatchTimeFrom: Date, stopwatchTotalTime: number
  }) {
    this._cleanAlarm()
    Object.assign(
      this, alarmType, description, alarmState,
      stopwatchTimeFrom, stopwatchTotalTime
    )
  }

  set alarmType(alarmType: AlarmType) { this.alarmType = alarmType }

  set description(description: string) { this.description = description }

  set alarmState(alarmState: AlarmStateType) { this.alarmState = alarmState }

  set timeToActivate(timeToActivate: Date) { this.timeToActivate = timeToActivate }

  set repeatType(repeatType: RepeatType) { this.repeatType = repeatType }

  set repeatDaysOfWeek(repeatDaysOfWeek: Week) { this.repeatDaysOfWeek = repeatDaysOfWeek }

  set repeatCountdown(repeatCountdown: number) { this.repeatCountdown = repeatCountdown }

  set repeatFrom(repeatFrom: Date) { this.repeatFrom = repeatFrom }

  set playSound(playSound: boolean) { this.playSound = playSound }

  set soundPath(soundPath: string) { this.soundPath = soundPath }

  set repeatSound(repeatSound: boolean) { this.repeatSound = repeatSound }

  set startApplication(startApplication: boolean) { this.startApplication = startApplication }

  set applicationCommand(applicationCommand: string) { this.applicationCommand = applicationCommand }

  set timerTimeFrom(timerTimeFrom: Date) { this.timerTimeFrom = timerTimeFrom }

  set timerTimeToWait(timerTimeToWait: number) { this.timerTimeToWait = timerTimeToWait }

  set stopwatchTimeFrom(stopwatchTimeFrom: Date) { this.stopwatchTimeFrom = stopwatchTimeFrom }

  set stopwatchTotalTime(stopwatchTotalTime: number) { this.stopwatchTotalTime = stopwatchTotalTime }
}
