/**
 * Properties for implementation Timer or Stopwatch is non-required
 */
export interface AlarmFields {
  alarmType: AlarmType;
  description: string | undefined;
  alarmState: AlarmStateType | undefined;

  timeToActivate: Date | undefined;
  repeatType: RepeatType | undefined;
  repeatDaysOfWeek: Week | undefined;
  repeatCountdown: number | undefined;
  playSound: boolean | undefined;
  soundPath: string | undefined;
  repeatSound: boolean | undefined;
  startApplication: boolean | undefined;
  autoStopAlarm: boolean | undefined;
  applicationCommand: string | undefined;

  timerTimeFrom: Date | undefined;
  timerTimeToWait: number | undefined;

  stopwatchTimeFrom: Date | undefined;
  stopwatchTotalTime: number | undefined;
}

export type AlarmType = 'alarm' | 'timer' | 'stopwatch'
export type AlarmStateType = 'enabled' | 'disabled' | 'active'
export type RepeatType = 'once' | 'weekly' | 'countdown'

export interface Week {
  [key: string]: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}
