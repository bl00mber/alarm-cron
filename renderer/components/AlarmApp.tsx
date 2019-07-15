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

import * as fs  from 'fs'
import { exec } from 'child_process'

import { remote, shell, ipcRenderer } from 'electron'
import * as Store from 'electron-store'

import * as React from 'react'
import { cloneDeep, capitalize, compact } from 'lodash'
import EditAlarm from './EditAlarm'
import Alarm from '../../classes/Alarm'
import { SettingsFields, AlarmType, AlarmStateType,
  RepeatType, Week } from '../../types/alarm'

import '../styles/AlarmApp.scss'

import imgAlarm from '../assets/img/alarm.png'
import imgStopwatch from '../assets/img/stopwatch.png'
import imgTimer from '../assets/img/timer.png'

import imgNew from '../assets/img/new.png'
import imgEdit from '../assets/img/edit.png'
import imgDelete from '../assets/img/delete.png'

import imgPlay from '../assets/img/play.png'
import imgPause from '../assets/img/pause.png'
import imgStop from '../assets/img/stop.png'
import imgPostpone from '../assets/img/postpone.png'

import imgWhitePlay from '../assets/img/white-play.png'
import imgWhitePause from '../assets/img/white-pause.png'
import imgWhiteStop from '../assets/img/white-stop.png'

interface State {
  store: Store,
  currentTime: Date,
  settings: SettingsFields,
  alarms: Alarm[],
  selectedAlarmIndex: number | null,
  editIsEnabled: boolean,
  player: AudioBufferSourceNode | null,
  isPlaying: boolean,
  cachedSoundBuffer: ArrayBuffer | null,
  cachedSoundPath: string | null,
}

export default class AlarmApp extends React.Component<any, State> {
  currentTimeInterval: NodeJS.Timeout;
  saveAlarmsInterval: NodeJS.Timeout;
  updateAlarmsTimeout: NodeJS.Timeout;

  constructor (props: object) {
    super(props)

    const store = new Store()

    // @ts-ignore
    const settings: SettingsFields = store.get('settings')
    const alarmsJSON = store.get('alarms')
    let alarms: Alarm[] = []
    // @ts-ignore
    if (alarmsJSON && compact(alarmsJSON).length > 0) {
      // @ts-ignore
      alarmsJSON.forEach((alarmJSON, index) => {
        const alarm = new Alarm({
          description: settings.descAlarm, alarmState: settings.alarmState,
          timeToActivate: this.addSecondsToNow(
            settings.timeToActivateOffset, settings.floorSeconds),
          repeatType: settings.repeatType, repeatDaysOfWeek: settings.repeatDaysOfWeek,
          repeatCountdown: settings.repeatCountdown, repeatFrom: new Date(),
          playSound: settings.playSound, soundPath: settings.soundPath, repeatSound: settings.repeatSound,
          startApplication: settings.startApplication, autoStopAlarm: settings.autoStopAlarm,
          applicationCommand: settings.applicationCommand,
        })

        alarm.restoreFrom(alarmJSON)
        alarms.push(alarm)
      })
    }

    this.state = {
      store,
      currentTime: new Date(),
      // @ts-ignore
      settings,
      alarms: compact(alarms),
      selectedAlarmIndex: null,
      editIsEnabled: false,

      player: null,
      isPlaying: false,
      cachedSoundBuffer: null,
      cachedSoundPath: null,
    }

    ipcRenderer.on('res-settings', this.updateStateSettings)

    ipcRenderer.on('enable-all-disabled-alarms', this.enableAllDisabledAlarms)
    ipcRenderer.on('pause-all-enabled-alarms', this.pauseAllEnabledAlarms)
    ipcRenderer.on('reset-all-active-alarms', this.resetAllActiveAlarms)
    ipcRenderer.on('postpone-all-active-alarms', this.postponeAllActiveAlarms)

    window.addEventListener('unload', (e) => {
      this.updateStoreAlarms()
    })
  }

  componentDidMount () {
    this.currentTimeInterval = setInterval(() =>
      this.setState({ currentTime: new Date() }, this.alarmsHandler), 1000)
    this.saveAlarmsInterval = setInterval(this.updateStoreAlarmsForCountdowns, 300000) // 5m
    this.updateAppSize()
    if (!this.state.settings.startInTray) ipcRenderer.send('activate')
  }

  componentWillUnmount () {
    clearInterval(this.currentTimeInterval)
    clearInterval(this.saveAlarmsInterval)
  }

  updateStateSettings = (event: any, settings: SettingsFields) => {
    this.setState({ settings }, this.updateAppSize)
  }

  updateAppSize = () => {
    const { settings } = this.state
    const height = settings.appHeightPx
    let width
    if (this.state.editIsEnabled && this.state.selectedAlarmIndex !== null)
    { width = settings.listWidthPx + settings.editWidthPx }
    else { width = settings.listWidthPx }

    const currentWindow = remote.getCurrentWindow()
    const size = currentWindow.getSize()
    const sizeIsTheSame = size[0] === width && size[1] === height

    if (typeof width === 'number' && typeof height === 'number') {
      if (!sizeIsTheSame) {
        currentWindow.setMinimumSize(width, height)
        currentWindow.setSize(width, height)
        // currentWindow.setSize(1200, 800) // test
      }
    } else {
      throw new TypeError('incorrect window dimensions type')
    }
  }

  updateStoreAlarms = () => {
    this.state.store.set('alarms', this.state.alarms)
  }

  updateStoreAlarmsForCountdowns = () => {
    this.state.alarms.forEach(alarm => {
      if (alarm.alarmType === 'timer' || alarm.alarmType === 'stopwatch') {
        if (alarm.alarmState !== 'disabled') this.updateStoreAlarms()
      }
    })
  }

  updateStoreAlarmDelayed = () => {
    if (this.updateAlarmsTimeout) clearInterval(this.updateAlarmsTimeout)
    this.updateAlarmsTimeout = setTimeout(this.updateStoreAlarms, 3000)
  }

  alarmsHandler = () => {
    const { settings, alarms, currentTime, player, isPlaying } = this.state
    let activeAlarmsCount = 0
    let isPlayActivated = false // only play 1 alarm per second

    const alarmsUpd = alarms.map((alarm, index) => {
      if (alarm.alarmState === 'enabled') {
        if (alarm.alarmType === 'alarm') {
          if (currentTime.getTime() > alarm.timeToActivate.getTime() && isPlayActivated === false) {

            if (!alarm.autoStopAlarm) {
              alarm.alarmState = 'active'
              if (settings.showNotification) {
                this.showNotification(capitalize(alarm.alarmType), alarm.description)}
              if (alarm.playSound) {
                isPlayActivated = true
                alarm.timeOfActivation = new Date()
                this.playSound(alarm.soundPath, alarm.repeatSound)
              }
            } else {
              alarm.resetAlarm()
            }
            if (alarm.startApplication) this.startApplication(alarm.applicationCommand)
          }
        }
        else if (alarm.alarmType === 'timer') {
          if (alarm.timerTimeToWaitCountdown > 0) alarm.timerTimeToWaitCountdown -= 1
          if (alarm.timerTimeToWaitCountdown === 0 && isPlayActivated === false) {

            if (!alarm.autoStopAlarm) {
              alarm.alarmState = 'active'
              if (settings.showNotification) {
                this.showNotification(capitalize(alarm.alarmType), alarm.description)}
              if (alarm.playSound) {
                isPlayActivated = true
                this.playSound(alarm.soundPath, alarm.repeatSound)
              }
            } else {
              alarm.resetTimer()
            }
            if (alarm.startApplication) this.startApplication(alarm.applicationCommand)
          }
        }
        else if (alarm.alarmType === 'stopwatch') {
          alarm.stopwatchTotalTime += 1
        }
      }
      else if (alarm.alarmState === 'active') {
        activeAlarmsCount += 1

        // Turn on sound again if alarm app was reloaded with active alarms
        if (isPlayActivated === false && player === null) {
          if (alarm.playSound) {
            isPlayActivated = true
            this.playSound(alarm.soundPath, alarm.repeatSound)
          }
        }

        // Disable alarms that has been active for more than certain time
        if (settings.autoStopAfterMMIsActive) {
          if (alarm.alarmType === 'alarm') {
            if (currentTime.getTime() >
              (alarm.timeOfActivation.getTime() + settings.autoStopAfterMM*60000)) {
              activeAlarmsCount -= 1
              alarm.resetAlarm()
            }
          }
          else if (alarm.alarmType === 'timer') {
            if (alarm.timerTimeToWaitCountdown < settings.autoStopAfterMM*-60) {
              activeAlarmsCount -= 1
              alarm.resetTimer()
            }
          }
        }
      }

      return alarm
    })

    if (player && isPlaying && activeAlarmsCount === 0) this.stopPlayer()
    this.setState({ alarms: alarmsUpd })
  }

  showNotification (title: string, body: string) {
    if (title === body) {
      ipcRenderer.send('show-notification', title, '')
    } else {
      ipcRenderer.send('show-notification', title, body)
    }
  }

  playSound = (soundPath: string, repeatSound: boolean) => {
    this.stopPlayer()
    const { cachedSoundBuffer, cachedSoundPath } = this.state

    if (cachedSoundBuffer !== null && cachedSoundPath === soundPath) {
      const arrayBuffer = cachedSoundBuffer // check if will work without
      this.playSoundInContext(arrayBuffer, soundPath, repeatSound)
    }
    else {
      fs.exists(soundPath, (exists: boolean) => {
        if (exists) {
          ipcRenderer.send('icon-tray-active')
          const uint8Array = fs.readFileSync(soundPath)
          const arrayBuffer = new Uint8Array(uint8Array).buffer
          this.playSoundInContext(arrayBuffer, soundPath, repeatSound)
        } else {
          console.error('file', soundPath, 'does not exists') }
      })
    }
  }

  playSoundInContext = (_arrayBuffer: ArrayBuffer, soundPath: string, repeatSound: boolean) => {
    const arrayBuffer = _arrayBuffer.slice(0) // prevents link on source object
    const context = new AudioContext()
    context.decodeAudioData(arrayBuffer, (audioBuffer) => {
      const player = context.createBufferSource()
      player.buffer = audioBuffer
      player.connect(context.destination)
      player.start(0, 0)
      if (repeatSound) player.loop = true

      this.setState({ player, isPlaying: true, cachedSoundBuffer: _arrayBuffer,
        cachedSoundPath: soundPath })
    })
  }

  stopPlayer = () => {
    const { player } = this.state
    this.setState({ isPlaying: false })
    if (player) {
      player.stop()
      ipcRenderer.send('icon-tray')
    }
  }

  stopPlayerAndCheckForActive = () => {
    this.stopPlayer()
    const { alarms } = this.state

    setTimeout(() => {
    for (let alarm of alarms) {
      if (alarm.alarmState === 'active') {
        // Restart player if player from the last active alarm has been turned off
        if (alarm.playSound) {
          this.playSound(alarm.soundPath, alarm.repeatSound)
          break
        }
      }
    }}, 500)
  }

  startApplication = (applicationCommand: string) => {
    try {
      exec(applicationCommand, (err: Error, stdout: string, stderr: string) => {
        if (err) console.error(err)
      })
    }
    catch(error) { console.error(error) }
  }

  addSecondsToNow = (seconds: number, floorSeconds: boolean): Date => {
    // currentTime -> timestamp/1000 -> +ss -> timestamp*1000 -> new Date
    // then set date seconds to 00
    let currentTime
    if (this.state) { currentTime = this.state.currentTime }
    else { currentTime = new Date() }
    const deferredDate = new Date((Math.floor(currentTime.getTime()/1000)+seconds)*1000)
    if (floorSeconds) deferredDate.setSeconds(0)
    return deferredDate
  }

  toDDMMHHmmss (date: Date): string {
    const month = date.toLocaleString('en-us', {month: 'short'})
    const day = date.getDate()
    // do not show current day/month
    const { currentTime } = this.state
    const curMonth = currentTime.toLocaleString('en-us', {month: 'short'})
    const curDay = currentTime.getDate()

    let timeStr
    if (date.getSeconds() === 0) { timeStr = date.toLocalISOString().slice(11,16) }
    else { timeStr = date.toLocalISOString().slice(11,19) }

    if (day === curDay && month === curMonth) { return timeStr }
    else { return day+' '+month+' '+timeStr }
  }

  toDDHHmmss (ssTotal: number, alarmType: AlarmType): string {
    if (ssTotal < 1 && alarmType !== 'stopwatch') return 'Expired'
    let str = ''
    const dd = Math.floor(ssTotal/86400)
    let ssRem = ssTotal%86400

    const hh = Math.floor(ssRem/3600)
    let mm: any = Math.floor((ssRem-(hh*3600))/60)
    let ss: any = ssRem-(hh*3600)-(mm*60)

    if (mm < 10) {mm = '0'+mm}
    if (ss < 10) {ss = '0'+ss}

    if (dd === 0 && hh === 0) { str = mm+':'+ss }
    else if (dd === 0) { str = hh+':'+mm+':'+ss }
    else { str = dd+'D '+hh+':'+mm+':'+ss }
    return str
  }

  ssBeforeDateFromNow (date: Date): number {
    const now = new Date()
    return Math.floor((date.getTime()-now.getTime())/1000)
  }

  weekToStr (_week: Week): string {
    const repeatDaysOfWeek: Week = {'mon': _week.mon, 'tue': _week.tue, 'wed': _week.wed,
      'thu': _week.thu, 'fri': _week.fri, 'sat': _week.sat, 'sun': _week.sun}

    let weekStr = ''
    for (let key in repeatDaysOfWeek) {
      if (repeatDaysOfWeek[key]) {
        if (weekStr.length > 0) { weekStr = weekStr+', '+capitalize(key) }
        else { weekStr += capitalize(key) }
      }
    }
    return weekStr
  }

  repeatCountdownToStr (repeatFrom: Date, repeatCountdown: number): string {
    const day = repeatFrom.getDate()
    const month = repeatFrom.toLocaleString('en-us', {month: 'short'})
    const year = repeatFrom.getFullYear()
    return 'Every '+Number(repeatCountdown)+' day from '+day+' '+month+' '+year
  }

  repeatToJSX (
    repeatType: RepeatType, repeatDaysOfWeek: Week,
    repeatCountdown: number, repeatFrom: Date
  ): React.ReactElement<{}> {
    switch(repeatType) {
      case 'once': return null
      case 'weekly': return <div className="alarm-countdown-child">
        {this.weekToStr(repeatDaysOfWeek)}
      </div>
      case 'countdown': return <div className="alarm-countdown-child">
        {this.repeatCountdownToStr(repeatFrom, repeatCountdown)}
      </div>
    }
  }

  getAlarmIconClass (alarmType: AlarmType): string {
    switch(alarmType) {
      case 'alarm': return 'img-alarm-type icon-alarm padding'
      case 'timer': return 'img-alarm-type icon-timer padding'
      case 'stopwatch': return 'img-alarm-type icon-stopwatch padding'
    }
  }

  getAlarmIconImage (alarmType: AlarmType): string {
    switch(alarmType) {
      case 'alarm': return `url(${imgAlarm})`
      case 'timer': return `url(${imgTimer})`
      case 'stopwatch': return `url(${imgStopwatch})`
    }
  }

  alarmCountdownsJSX = (
    alarmType: AlarmType, alarm: Alarm): React.ReactElement<{}> => {
    switch(alarmType) {
      case 'alarm':
        const ssRemained = this.ssBeforeDateFromNow(alarm.timeToActivate)
        return <div className={"alarm-countdown"+((ssRemained<1)?' expired':'')}>
          <div className="alarm-countdown-child">
            {this.toDDMMHHmmss(alarm.timeToActivate)}
          </div>
          <div className="alarm-countdown-child">
            {this.toDDHHmmss(ssRemained, alarm.alarmType)}
          </div>
        </div>
      case 'timer':
        return <div className={"alarm-countdown"+
          ((alarm.timerTimeToWaitCountdown<1)?' expired':'')}>
          {this.toDDHHmmss(alarm.timerTimeToWaitCountdown, alarm.alarmType)}</div>
      case 'stopwatch':
        return <div className="alarm-countdown">
          {this.toDDHHmmss(alarm.stopwatchTotalTime, alarm.alarmType)}</div>
    }
  }

  alarmsJSX = (): React.ReactElement<{}>[] => {
    const { settings, alarms, selectedAlarmIndex } = this.state
    const alarmsJSX: React.ReactElement<{}>[] = []

    alarms.map((alarm: Alarm, index: number) => {
      alarmsJSX.push(<div key={index} className={"alarm-container" +
          (index === selectedAlarmIndex ? ' active' : '')}>
        <div className="alarm-main-block">
          <div className="alarm-select-container"
            onClick={() => {
              this.updateStoreAlarmDelayed()
              if (selectedAlarmIndex === index) {
                this.setState({ selectedAlarmIndex: null }, this.updateAppSize)
              } else {
                this.setState({ selectedAlarmIndex: index }, this.updateAppSize)
              }
            }}>
            <div className={this.getAlarmIconClass(alarm.alarmType)}
              style={{backgroundImage: this.getAlarmIconImage(alarm.alarmType)}}></div>
            {this.alarmCountdownsJSX(alarm.alarmType, alarm)}
            <div className="alarm-description padding" style={
              (alarm.alarmType==='alarm' && alarm.repeatType!=='once')?
              {maxWidth: '140px'}:{}}>{alarm.description}</div>
          </div>
          <div className={"alarm-handler__btn padding "+
            this.getAlarmHandlerClass(alarm.alarmState)}
            onClick={() => {
              if (alarm.alarmState === 'active') this.stopPlayerAndCheckForActive()
              this.runAlarmHandler(alarm.alarmType, alarm.alarmState, index)
            }}>
            <div className="alarm-handler__btn-img"
              style={{backgroundImage: this.getAlarmHandlerImage(alarm.alarmState)}}></div>
          </div>
        </div>

        {(settings.showRepeatInfo && alarm.alarmType === 'alarm' && alarm.repeatType !== 'once') &&
        <div className="alarm-repeat">
          {this.repeatToJSX(
            alarm.repeatType,
            alarm.repeatDaysOfWeek,
            alarm.repeatCountdown,
            alarm.repeatFrom,
          )}
        </div>}
      </div>
    )})
    return alarmsJSX
  }

  // Modification controls handlers
  addDefaultAlarm = () => {
    const { settings } = this.state

    let timeToActivate;

    if (settings.staticTimeIsActive === false) {
      timeToActivate = this.addSecondsToNow(settings.timeToActivateOffset, settings.floorSeconds)
    } else {
      const date = new Date()
      const time = settings.staticTimeToActivate.split(':')
      date.setHours(time[0], time[1], 0)
      if (new Date().getTime() > date.getTime()) { // If time is gone, set alarm to the next day
        date.setDate(date.getDate()+1)
      }
      timeToActivate = date
    }

    const alarm = new Alarm({
      description: settings.descAlarm, alarmState: settings.alarmState,
      timeToActivate,
      repeatType: settings.repeatType, repeatDaysOfWeek: settings.repeatDaysOfWeek,
      repeatCountdown: settings.repeatCountdown, repeatFrom: new Date(),
      playSound: settings.playSound, soundPath: settings.soundPath, repeatSound: settings.repeatSound,
      startApplication: settings.startApplication, autoStopAlarm: settings.autoStopAlarm,
      applicationCommand: settings.applicationCommand,
    })

    switch(settings.alarmType) {
      case 'timer':
        alarm.setTimer({
          description: settings.descTimer, alarmState: settings.alarmState,
          timerTimeToWait: settings.timerTimeToWait,
        })
        break
      case 'stopwatch':
        alarm.setStopwatch({
          description: settings.descStopwatch, alarmState: settings.alarmState,
          stopwatchTotalTime: settings.stopwatchTotalTime,
        })
    }

    this.setState({ alarms: [...this.state.alarms, alarm] }, this.updateStoreAlarmDelayed)
  }

  deleteSelectedAlarmIndex = () => {
    const { store, alarms } = this.state
    let { selectedAlarmIndex, editIsEnabled } = this.state
    if (selectedAlarmIndex === null) return;
    alarms.splice(selectedAlarmIndex, 1)
    if (alarms.length != 0) {
      selectedAlarmIndex = alarms.length-1 // select last alarm
    } else {
      selectedAlarmIndex = null
      editIsEnabled = false
    }
    this.setState({ alarms, selectedAlarmIndex, editIsEnabled }, () => {
      this.updateAppSize()
      this.updateStoreAlarmDelayed()
    })
  }

  updateAlarmKey = (key: string, value: any, callback?: () => any) => {
    const { alarms, selectedAlarmIndex } = this.state
    alarms[selectedAlarmIndex][key] = value

    // Alarm state set to disabled before time change to prevent
    // accidental alarm activation
    if (key === 'timeToActivate' || key === 'timerTimeToWait')
      alarms[selectedAlarmIndex].alarmState = 'disabled'

    if (callback) { this.setState({ alarms }, callback) }
    else { this.setState({ alarms }) }
  }

  updateAlarmInstance = (alarm: Alarm, alarmIndex?: number, callback?: () => any) => {
    const { alarms, selectedAlarmIndex } = this.state
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarms[alarmIndex] = alarm
    if (callback) { this.setState({ alarms }, callback) }
    else { this.setState({ alarms }) }
  }

  /**
   * Process controls: enabled->pause, disabled->enable, active->reset
   * pause: enabled->disabled
   * activate: disabled->enabled
   * reset: active->disabled
   * since stopwatch cannot be active, handler ${resetStopwatch} should be accessed directly
   * if alarmIndex is not set, selectedAlarmIndex used
  **/
  runAlarmHandler = (alarmType: AlarmType, alarmState: AlarmStateType, alarmIndex?: number) => {
    const { alarms, selectedAlarmIndex } = this.state
    let alarm
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarm = cloneDeep(alarms[alarmIndex])

    const handlerKey = this.getAlarmHandlerKey(alarmType, alarmState)
    alarm[handlerKey]()

    this.updateAlarmInstance(alarm, alarmIndex, this.updateStoreAlarmDelayed)
  }

  runCustomAlarmHandler = (handlerKey: string, args?: any[], alarmIndex?: number) => {
    const { alarms, selectedAlarmIndex } = this.state
    let alarm
    if (alarmIndex === undefined) alarmIndex = selectedAlarmIndex
    alarm = cloneDeep(alarms[alarmIndex])

    if (args) { alarm[handlerKey](...args) }
    else { alarm[handlerKey]() }
    this.updateAlarmInstance(alarm, alarmIndex, this.updateStoreAlarmDelayed)
  }

  getAlarmHandlerKey (alarmType: AlarmType, alarmState: AlarmStateType): string {
    switch(alarmType) {
      case 'alarm':
        switch(alarmState) {
          case 'enabled': return 'pauseAlarm'
          case 'disabled': return 'enableAlarm'
          case 'active': return 'resetAlarm'
        }
        break
      case 'timer':
        switch(alarmState) {
          case 'enabled': return 'pauseTimer'
          case 'disabled': return 'enableTimer'
          case 'active': return 'resetTimer'
        }
        break
      case 'stopwatch':
        switch(alarmState) {
          case 'enabled': return 'pauseStopwatch'
          case 'disabled': return 'enableStopwatch'
        }
        break
    }
  }

  getAlarmHandlerClass (alarmState: AlarmStateType): string {
    switch(alarmState) {
      case 'enabled': return 'pause'
      case 'disabled': return 'enable'
      case 'active': return 'reset'
    }
  }

  getAlarmHandlerImage (alarmState: AlarmStateType): string {
    switch(alarmState) {
      case 'enabled': return `url(${imgWhitePause})`
      case 'disabled': return `url(${imgWhitePlay})`
      case 'active': return `url(${imgWhiteStop})`
    }
  }

  // Process all alarms
  enableAllDisabledAlarms = () => {
    const { alarms } = this.state

    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'disabled') {
        const updAlarm = cloneDeep(alarms[index])
        if (alarm.alarmType === 'alarm') { updAlarm.enableAlarm() }
        else if (alarm.alarmType === 'timer') { updAlarm.enableTimer() }
        else if (alarm.alarmType === 'stopwatch') { updAlarm.enableStopwatch() }
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  pauseAllEnabledAlarms = () => {
    const { alarms } = this.state

    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'enabled') {
        const updAlarm = cloneDeep(alarms[index])
        if (alarm.alarmType === 'alarm') { updAlarm.pauseAlarm() }
        else if (alarm.alarmType === 'timer') { updAlarm.pauseTimer() }
        else if (alarm.alarmType === 'stopwatch') { updAlarm.pauseStopwatch() }
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  resetAllActiveAlarms = () => {
    this.stopPlayer()
    const { alarms } = this.state

    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'active') {
        const updAlarm = cloneDeep(alarms[index])
        if (alarm.alarmType === 'alarm') { updAlarm.resetAlarm() }
        else if (alarm.alarmType === 'timer') { updAlarm.resetTimer() }
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  postponeAllActiveAlarms = () => {
    this.stopPlayer()
    const { settings, alarms } = this.state

    alarms.forEach((alarm, index) => {
      if (alarm.alarmState === 'active' &&
        (alarm.alarmType === 'alarm' || alarm.alarmType === 'timer')) {
        const updAlarm = cloneDeep(alarms[index])

        if (alarm.alarmType === 'alarm') {
          updAlarm.postponeAlarm(settings.postponeOffset) }
        else if (alarm.alarmType === 'timer') {
          updAlarm.postponeTimer(settings.postponeOffset) }
        alarms[index] = updAlarm
      }
    })
    this.setState({ alarms })
  }

  render () {
    const { store, settings, alarms, currentTime, selectedAlarmIndex, editIsEnabled } = this.state
    return (
      <div className="app-container">
        <div className="alarms-container" style={{width: settings.listWidthPx+'px'}}>

          <div className="alarms-controls">
            <div className="alarms-modification-controls padding-controls">
              <div className="new-alarm btn"
                onClick={this.addDefaultAlarm}
                style={{backgroundImage: `url(${imgNew})`}}></div>

              <div className={"edit-alarm btn" + (editIsEnabled ? ' active': '')}
                onClick={() => {
                  this.updateStoreAlarmDelayed()
                  this.setState({
                    editIsEnabled: !editIsEnabled,
                    selectedAlarmIndex: editIsEnabled ? null : selectedAlarmIndex,
                  }, this.updateAppSize)
                }}
                style={{backgroundImage: `url(${imgEdit})`}}></div>

              <div className="delete-alarm btn btn-last"
                onClick={this.deleteSelectedAlarmIndex}
                style={{backgroundImage: `url(${imgDelete})`}}></div>
            </div>

            <div className="alarms-process-controls padding-controls">
              <div className="process-all-alarms btn"
                onClick={this.enableAllDisabledAlarms}
                style={{backgroundImage: `url(${imgPlay})`}}></div>

              <div className="process-all-alarms btn"
                onClick={this.pauseAllEnabledAlarms}
                style={{backgroundImage: `url(${imgPause})`}}></div>

              <div className="process-all-alarms btn"
                onClick={this.resetAllActiveAlarms}
                style={{backgroundImage: `url(${imgStop})`}}></div>

              <div className="postpone-active-alarms btn btn-last"
                onClick={this.postponeAllActiveAlarms}
                style={{backgroundImage: `url(${imgPostpone})`}}></div>
            </div>
          </div>

          <div className="alarms-list">
            {(alarms.length > 0) && this.alarmsJSX()}
          </div>
        </div>

        {(editIsEnabled && selectedAlarmIndex !== null) &&
        <div className="edit-container" style={{width: settings.editWidthPx+'px'}}>
          <EditAlarm
            alarm={alarms[selectedAlarmIndex]}
            settings={settings}
            currentTime={currentTime}

            stopPlayerAndCheckForActive={this.stopPlayerAndCheckForActive}
            updateAlarmKey={this.updateAlarmKey}
            updateAlarmInstance={this.updateAlarmInstance}
            addSecondsToNow={this.addSecondsToNow}
            toDDHHmmss={this.toDDHHmmss}
            runAlarmHandler={this.runAlarmHandler}
            runCustomAlarmHandler={this.runCustomAlarmHandler}
            getAlarmHandlerClass={this.getAlarmHandlerClass}
            getAlarmHandlerImage={this.getAlarmHandlerImage}
          />
          <div className="settings-footer padding">
            <a className="copyright" target="_blank"
              href="https://github.com/bl00mber/alarm-cron"
              onClick={e => {
                event.preventDefault()
                // @ts-ignore
                let url = e.target.href
                shell.openExternal(url)
              }}>Nick Reiley (c)</a>
          </div>
        </div>}
      </div>
    )
  }
}
