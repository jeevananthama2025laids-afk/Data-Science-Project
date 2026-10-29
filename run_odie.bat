@echo off
title ODIE - Organizational Decision Intelligence Engine
echo ========================================================
echo   Starting ODIE Decision Intelligence Platform...
echo ========================================================
echo.
cd /d "%~dp0"
echo Starting FastAPI Web Server on http://127.0.0.1:8000 ...
start http://127.0.0.1:8000
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
pause
