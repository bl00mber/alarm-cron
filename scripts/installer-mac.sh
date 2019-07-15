#!/usr/bin/env bash
electron-installer-dmg "build/alarm-cron-darwin-x64/alarm-cron.app" "Alarm-Cron" \
--out=build/installers/ --icon=icon/icon.icns --title="Alarm Cron"
