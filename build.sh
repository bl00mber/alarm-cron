EXTRARESOURCES="\
--extra-resource='resources/default.mp3' \
--extra-resource='resources/Evacuation-Test-By-The-River-Japan.mp3' \
--extra-resource='resources/Ringing-Train-Station-Da-Nang-Vietnam.mp3' \
--extra-resource='resources/Ringing-Train-Station-Street-Da-Nang-Vietnam.mp3' \
--extra-resource='resources/Telemetry-Tech-Data-23.mp3' \
"

electron-packager . --overwrite \
$EXTRARESOURCES \
--platform=linux --arch=x64 \
--icon='resources/icon/icon.png' --prune=true --out=build

# electron-packager . --overwrite \
# $EXTRARESOURCES \
# --platform=win32 --asar=true --arch=ia32 \
# --icon='resources/icon/icon.ico' --prune=true --out=build \
# --version-string.CompanyName='Nick Reiley' \
# --version-string.FileDescription='Time management' --version-string.ProductName='Alarm'
#
# electron-packager . --overwrite \
# $EXTRARESOURCES \
# --platform=darwin --arch=x64 \
