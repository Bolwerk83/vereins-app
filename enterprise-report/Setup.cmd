@echo off
chcp 65001 >nul
title Enterprise Reporting - Einrichtung
cd /d "%~dp0"
echo.
echo Einrichtung wird gestartet...
echo.
node setup.mjs
echo.
pause
