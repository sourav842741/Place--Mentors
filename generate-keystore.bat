@echo off
echo Generating upload keystore for Play Store...
echo.

keytool -genkeypair -v -storetype=PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg=RSA -keysize=2048 -validity=10000 ^
  -storepass Placementor@123 -keypass Placementor@123 ^
  -dname "CN=Place Mentor, OU=Development, O=Placementor, L=, ST=, C=" ^
  -ext SAN=dns:placementor.online,ip:127.0.0.1

echo.
echo SUCCESS! Keystore created: my-upload-key.keystore
echo.
echo Get SHA256 fingerprint:
keytool -list -v -keystore my-upload-key.keystore -alias my-key-alias -storepass Placementor@123 ^| findstr "SHA256"

echo.
echo Copy the SHA256 value and replace in: frontend/public/.well-known/assetlinks.json
echo.
pause
