@echo off
echo Installing Bubblewrap CLI...
npm install -g @bubblewrap/cli

echo.
echo Building TWA...
cd /d "%~dp0"
bubblewrap build ^
  --keystore=..\..\my-upload-key.keystore ^
  --keystoreAlias=my-key-alias ^
  --keystorePassword=Placementor@123 ^
  --keyPassword=Placementor@123

echo.
echo SUCCESS! Check app-release.aab in twa/app/build/outputs/bundle/release/
echo.
echo 1. Update assetlinks.json SHA256 on production server
echo 2. Verify: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://placementor.online^&relation=delegate_permission/common.handle_all_urls
echo 3. Upload app-release.aab to Play Console
pause
