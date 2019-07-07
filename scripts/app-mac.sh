#!/usr/bin/env bash
source ./scripts/config.sh

electron-packager . --out=build --overwrite \
$EXTRARESOURCES \
--platform=darwin --arch=x64 \
--icon=resources/icon/icon.icns --prune=true --asar
