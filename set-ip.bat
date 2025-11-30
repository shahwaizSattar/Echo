@echo off
echo ========================================
echo Quick IP Setup
echo ========================================
echo.

REM Get current IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do set CURRENT_IP=%%a
set CURRENT_IP=%CURRENT_IP:~1%

echo Detected IP Address: %CURRENT_IP%
echo.
echo This will update frontend/.env with:
echo EXPO_PUBLIC_API_BASE=http://%CURRENT_IP%:5000
echo.
set /p CONFIRM="Continue? (Y/N): "

if /i "%CONFIRM%" NEQ "Y" (
    echo Cancelled.
    pause
    exit /b
)

REM Create or update .env file
echo # API Configuration > frontend\.env
echo # Change this IP address when your network IP changes >> frontend\.env
echo EXPO_PUBLIC_API_BASE=http://%CURRENT_IP%:5000 >> frontend\.env

echo.
echo ✓ Updated frontend/.env
echo.
echo Next steps:
echo 1. Restart your frontend: cd frontend ^&^& npm start
echo 2. If you have existing media, run: update-ip.bat
echo.
pause
