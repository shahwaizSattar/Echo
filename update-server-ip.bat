@echo off
setlocal enabledelayedexpansion

echo 🔧 Server IP Configuration Updater
echo.

if "%1"=="" (
    echo Usage: update-server-ip.bat [NEW_IP_ADDRESS]
    echo Example: update-server-ip.bat 192.168.1.100
    echo.
    echo Current IP configuration:
    echo Backend: 
    findstr "SERVER_IP" backend\.env 2>nul || echo   SERVER_IP not set
    echo Frontend:
    findstr "EXPO_PUBLIC_SERVER_IP" frontend\.env 2>nul || echo   EXPO_PUBLIC_SERVER_IP not set
    echo.
    exit /b 1
)

set NEW_IP=%1
echo 📝 Updating server IP to: %NEW_IP%
echo.

echo 🔧 Updating backend configuration...
if exist backend\.env (
    powershell -Command "(Get-Content backend\.env) -replace 'SERVER_IP=.*', 'SERVER_IP=%NEW_IP%' | Set-Content backend\.env"
    echo ✅ Updated backend\.env
) else (
    echo ⚠️ backend\.env not found
)

echo 🔧 Updating frontend configuration...
if exist frontend\.env (
    powershell -Command "(Get-Content frontend\.env) -replace 'EXPO_PUBLIC_SERVER_IP=.*', 'EXPO_PUBLIC_SERVER_IP=%NEW_IP%' | Set-Content frontend\.env"
    powershell -Command "(Get-Content frontend\.env) -replace 'EXPO_PUBLIC_API_BASE=http://[^:]+:', 'EXPO_PUBLIC_API_BASE=http://%NEW_IP%:' | Set-Content frontend\.env"
    echo ✅ Updated frontend\.env
) else (
    echo ⚠️ frontend\.env not found
)

echo.
echo 🎉 IP configuration updated successfully!
echo.
echo 📋 New configuration:
echo Backend SERVER_IP: %NEW_IP%
echo Frontend EXPO_PUBLIC_SERVER_IP: %NEW_IP%
echo.
echo 🔄 Remember to restart your development servers:
echo   - Backend: npm run dev (in backend folder)
echo   - Frontend: npm start (in frontend folder)
echo.