type AlarmType = 'alarm'
type TimerType = 'timer'
type StopwatchType = 'stopwatch'
type RepeatType = 'once' | 'weekly' | 'countdown'

interface Week {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

export default class Alarm {
  /**
   * @param type
   * @param description
   * @param timeToActivate          | AlarmType = 'alarm'
   * @param repeatType              | AlarmType = 'alarm'
   * @param repeatIsActive          | AlarmType = 'alarm'
   * @param repeatDaysOfWeek        | AlarmType = 'alarm'
   * @param repeatCountdown         | AlarmType = 'alarm'
   * @param repeatFrom              | AlarmType = 'alarm'
   * @param playSound               | AlarmType = 'alarm' | 'timer'
   * @param soundPath               | AlarmType = 'alarm' | 'timer'
   * @param repeatSound             | AlarmType = 'alarm' | 'timer'
   * @param startApplication        | AlarmType = 'alarm' | 'timer'
   * @param applicationCommand      | AlarmType = 'alarm' | 'timer'
   * @param timerTimeFrom           | AlarmType = 'timer'
   * @param timerTimeToWait         | AlarmType = 'timer'
   * @param stopwatchTimeFrom       | AlarmType = 'stopwatch'
   * @param stopwatchTotalTime      | AlarmType = 'stopwatch'
   */

  constructor(
    type: AlarmType, description: string
  ) {
    Object.assign(this, type, description)
  }

  _cleanAlarm() {
    this.timeToActivate = undefined
    this.repeatType = undefined
    this.repeatIsActive = undefined
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

  createAlarm(
    type: AlarmType, description: string, timeToActivate: Date,
    repeatType: RepeatType, repeatIsActive: boolean, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, applicationCommand: string
  ) {
    this._cleanAlarm()
    Object.assign(
      this, type, description, timeToActivate,
      repeatType, repeatIsActive, repeatDaysOfWeek,
      repeatCountdown, repeatFrom,
      playSound, soundPath, repeatSound,
      startApplication, applicationCommand
    )
  }

  createTimer(
    type: TimerType, description: string,
    playSound: boolean, soundPath: string, repeatSound: boolean,
    startApplication: boolean, applicationCommand: string,
    timerTimeFrom: Date, timerTimeToWait: number,
  ) {
    this._cleanAlarm()
    Object.assign(
      this, type, description,
      playSound, soundPath, repeatSound,
      startApplication, applicationCommand,
      timerTimeFrom, timerTimeToWait,
    )
  }

  createStopwatch(
    type: StopwatchType, description: string,
    stopwatchTimeFrom: Date, stopwatchTotalTime: number
  ) {
    this._cleanAlarm()
    Object.assign(
      this, type, description,
      stopwatchTimeFrom, stopwatchTotalTime
    )
  }

  set type(type: AlarmType) { this.type = type }

  set description(description: string) { this.description = description }

  set timeToActivate(timeToActivate: Date) { this.timeToActivate = timeToActivate }

  set repeatType(repeatType: RepeatType) { this.repeatType = repeatType }

  set repeatIsActive(repeatIsActive: boolean) { this.repeatIsActive = repeatIsActive }

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


  get type() { return this.type }

  get description() { return this.description }

  get timeToActivate() { return this.timeToActivate }

  get repeatType() { return this.repeatType }

  get repeatIsActive() { return this.repeatIsActive }

  get repeatDaysOfWeek() { return this.repeatDaysOfWeek }

  get repeatCountdown() { return this.repeatCountdown }

  get repeatFrom() { return this.repeatFrom }

  get playSound() { return this.playSound }

  get soundPath() { return this.soundPath }

  get repeatSound() { return this.repeatSound }

  get startApplication() { return this.startApplication }

  get applicationCommand() { return this.applicationCommand }

  get timerTimeFrom() { return this.timerTimeFrom }

  get timerTimeToWait() { return this.timerTimeToWait }

  get stopwatchTimeFrom() { return this.stopwatchTimeFrom }

  get stopwatchTotalTime() { return this.stopwatchTotalTime }
}
