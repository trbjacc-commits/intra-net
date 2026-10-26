@echo off
title Deploy - Intranet Academica
echo ============================================
echo    Compilando frontend para produccion...
echo ============================================

cd /d "%~dp0frontend"
call npm run build

echo.
echo Copiando build al backend...
if exist "%~dp0backend\public" rmdir /s /q "%~dp0backend\public"
xcopy /s /e /i /q "%~dp0frontend\build" "%~dp0backend\public"

echo.
echo ============================================
echo    Listo! El backend sirve todo.
echo    Solo subi la carpeta 'backend' a Railway.
echo ============================================
echo.
pause
