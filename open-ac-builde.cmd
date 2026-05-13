@echo off
cd /d "%~dp0"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "APP=%~dp0index.html"

if exist "%EDGE%" (
  start "" "%EDGE%" "%APP%"
  exit /b
)

if exist "%CHROME%" (
  start "" "%CHROME%" "%APP%"
  exit /b
)

start "" "%APP%"
