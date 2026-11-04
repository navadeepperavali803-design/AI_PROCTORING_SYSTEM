@echo off
title ProctorAI - FastAPI Backend
cd /d "%~dp0backend"
set "PYTHONPATH=%~dp0backend"
if exist "venv\Scripts\python.exe" (
    echo ===================================================
    echo   Starting ProctorAI Backend on http://localhost:8000
    echo   Interactive API Docs:  http://localhost:8000/docs
    echo ===================================================
    venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    echo [ERROR] Virtual environment not found in backend\venv!
    pause
)
pause
