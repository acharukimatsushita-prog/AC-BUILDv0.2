@echo off
cd /d "%~dp0"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if not exist "%EDGE%" (
  echo Microsoft Edge was not found.
  pause
  exit /b 1
)

start "" "%EDGE%" "%~dp0index.html"
