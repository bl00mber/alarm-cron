#!/usr/bin/env bash
source ./scripts/config.sh

electron-packager . --out=build --overwrite \
$EXTRARESOURCES \
--platform=win32 --arch=ia32 \
--icon=resources/icon/icon.ico --prune=true --asar \
--version-string.CompanyName='Nick Reiley (https://github.com/bl00mber) <bloomber111@gmail.com>' \
--version-string.ProductName='Alarm Cron' \
--version-string.FileDescription='Alarm Cron' \
--version-string.OriginalFilename='AlarmCron' \
--version-string.InternalName='AlarmCron'
