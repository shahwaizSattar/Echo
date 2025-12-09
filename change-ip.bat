@echo off
echo 🔄 IP Configuration Changer
echo.

if "%1"=="" (
    echo Usage: change-ip.bat [NEW_IP_ADDRESS]
    echo Example: change-ip.bat 192.168.1.100
    echo.
    echo Or run without arguments to auto-detect:
    node change-ip.js
    pause
    exit /b
)

echo Changing IP to: %1
node change-ip.js %1

echo.
echo ✅ IP configuration updated!
echo.
echo Next steps:
echo 1. Restart backend: npm start (in backend folder)
echo 2. Restart frontend: npm start (in frontend folder)
echo.
pause