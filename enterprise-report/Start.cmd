@echo off
chcp 65001 >nul
title Enterprise Reporting
cd /d "%~dp0"
node start.mjs
pause
