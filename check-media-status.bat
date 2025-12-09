@echo off
echo ========================================
echo   Checking Media URL Status
echo ========================================
echo.

cd backend
node check-media-urls.js
cd ..

echo.
pause
