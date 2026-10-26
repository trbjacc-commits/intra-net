@echo off
title Intranet Academica
echo ============================================
echo    INTRANET ACADEMICA - Iniciando...
echo ============================================
echo.

cd /d "%~dp0backend"
start "Backend - Intranet" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

cd /d "%~dp0frontend"
start "Frontend - Intranet" cmd /k "set BROWSER=none && npm start"

echo.
echo Servidores iniciando...
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Espera unos segundos y abre: http://localhost:3000
echo.
echo Admin: admin@intranet.edu / admin123
echo.
pause
