@echo off
cd /d "%~dp0"
title AC-BUILDE

echo Opening AC-BUILDE...
set "APP_FILE=%~dp0index.html"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"

if exist "%EDGE%" (
  start "" "%EDGE%" "%APP_FILE%"
) else if exist "%CHROME%" (
  start "" "%CHROME%" "%APP_FILE%"
) else (
  start "" "%APP_FILE%"
)

echo.
echo If the browser does not open, double-click index.html.
echo.
pause
