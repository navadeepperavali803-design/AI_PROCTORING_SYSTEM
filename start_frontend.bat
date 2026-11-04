@echo off
title ProctorAI - React Frontend
cd /d "%~dp0frontend"
set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
echo ===================================================
echo   Starting ProctorAI Frontend on http://localhost:5173
echo ===================================================
call npm run dev
pause
