@echo off
title ProctorAI Full-Stack Launcher
echo =========================================================
echo   Starting ProctorAI Backend and Frontend concurrently...
echo =========================================================

start "ProctorAI Backend Server" cmd /k "%~dp0start_backend.bat"
start "ProctorAI Frontend Server" cmd /k "%~dp0start_frontend.bat"

echo.
echo Both servers have been launched in separate windows!
echo.
echo [Backend API]:     http://localhost:8000
echo [Swagger Docs]:    http://localhost:8000/docs
echo [Frontend App]:    http://localhost:5173
echo.
timeout /t 5
