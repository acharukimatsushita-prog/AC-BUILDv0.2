@echo off
cd /d "%~dp0"
title AC-BUILDE

echo Opening AC-BUILDE...
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" (
  echo Node.js was not found: %NODE_EXE%
  echo Please install Node.js or check the path.
  pause
  exit /b 1
)
"%NODE_EXE%" launch-ac-builde.mjs

echo.
echo If the browser does not open, go to http://127.0.0.1:8099
echo.
pause
