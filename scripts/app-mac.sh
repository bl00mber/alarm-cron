#!/usr/bin/env bash
source ./scripts/config.sh

electron-packager . --out=build --overwrite \
$IGNORE \
--platform=darwin --arch=x64 \
--icon=icon/icon.icns --prune=true --asar
