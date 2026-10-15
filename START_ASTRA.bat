@echo off
title ASTRA - Beyond the Stars
cd /d "%~dp0"
echo ========================================================
echo   Starting ASTRA - Beyond the Stars Dev Server...
echo ========================================================
echo.
echo Opening http://localhost:5173/ in your browser...
start http://localhost:5173/
echo.
npm run dev
pause
