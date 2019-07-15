#!/usr/bin/env bash
source ./scripts/config.sh

electron-packager . --out=build --overwrite \
$IGNORE \
--platform=linux --arch=x64 --prune=true
