@echo off
cd /d "%~dp0"
title AC-BUILDE server
echo AC-BUILDE server starting...
echo.
echo Open this URL in your browser:
echo http://127.0.0.1:8099
echo.
node server.mjs 8099
pause
