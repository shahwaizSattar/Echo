@echo off
echo ========================================
echo IP Address Update Helper
echo ========================================
echo.

REM Get current IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do set CURRENT_IP=%%a
set CURRENT_IP=%CURRENT_IP:~1%
echo Current IP Address: %CURRENT_IP%
echo.

REM Ask for old and new IP
set /p OLD_IP="Enter OLD IP address (or press Enter to skip database migration): "
set /p NEW_IP="Enter NEW IP address (default: %CURRENT_IP%): "

if "%NEW_IP%"=="" set NEW_IP=%CURRENT_IP%

echo.
echo ========================================
echo Summary:
if not "%OLD_IP%"=="" echo Old IP: %OLD_IP%
echo New IP: %NEW_IP%
echo ========================================
echo.

REM Update frontend config
echo [1/3] Updating frontend configuration...
powershell -Command "(Get-Content 'frontend\src\services\api.ts') -replace 'const YOUR_COMPUTER_IP = ''[0-9.]+''', 'const YOUR_COMPUTER_IP = ''%NEW_IP%''' | Set-Content 'frontend\src\services\api.ts'"
echo ✓ Frontend config updated
echo.

REM Run database migration if old IP provided
if not "%OLD_IP%"=="" (
    echo [2/3] Migrating database URLs...
    node backend\scripts\fixMediaUrls.js %OLD_IP% %NEW_IP%
    echo.
) else (
    echo [2/3] Skipping database migration (no old IP provided)
    echo.
)

REM Show next steps
echo [3/3] Next Steps:
echo.
echo 1. Restart your backend server:
echo    cd backend
echo    node server.js
echo.
echo 2. Restart your frontend:
echo    cd frontend
echo    npm start
echo.
echo 3. Clear app cache and reload
echo.
echo ========================================
echo Done!
echo ========================================
pause
