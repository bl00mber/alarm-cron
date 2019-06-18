/*
Copyright (c) Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

export type AlarmType = 'alarm' | 'timer' | 'stopwatch'
export type AlarmStateType = 'enabled' | 'disabled' | 'active'
export type RepeatType = 'once' | 'weekly' | 'countdown' | 'timer'

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

export interface AlarmFields {
  alarmType: AlarmType;
  description: string | undefined;
  alarmState: AlarmStateType | undefined;

  timeToActivate: Date | undefined;
  repeatType: RepeatType | undefined;
  repeatDaysOfWeek: Week | undefined;
  repeatCountdown: number | undefined;
  repeatFrom: Date | undefined;

  playSound: boolean | undefined;
  soundPath: string | undefined;
  repeatSound: boolean | undefined;
  startApplication: boolean | undefined;
  autoStopAlarm: boolean | undefined;
  applicationCommand: string | undefined;

  timerTimeFrom: Date | undefined;
  timerTimeToWait: number | undefined;
  timerTimeToWaitCountdown: number | undefined;

  stopwatchTimeFrom: Date | undefined;
  stopwatchTotalTime: number | undefined;
}

export interface SettingsFields {
  [key: string]: any;

  alarmType: AlarmType;
  descAlarm: string;
  descTimer: string;
  descStopwatch: string;
  alarmState: AlarmStateType;

  timeToActivateOffset: number;
  floorSeconds: boolean;
  repeatType: RepeatType;
  repeatDaysOfWeek: Week;
  repeatCountdown: number;
  playSound: boolean;
  soundPath: string;
  repeatSound: boolean;
  startApplication: boolean;
  autoStopAlarm: boolean;
  applicationCommand: string;

  timerTimeToWait: number;
  stopwatchTotalTime: number;

  postponeOffset: number;
  autoStopAfterMMIsActive: boolean;
  autoStopAfterMM: number;
  showNotification: boolean;

  listWidthPx: number;
  editWidthPx: number;
  appHeightPx: number;
}
