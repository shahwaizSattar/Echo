@echo off
echo.
echo ========================================
echo   Seed Database and Start Testing
echo ========================================
echo.
echo This script will:
echo 1. Seed the database with dummy data
echo 2. Show you how to start the app
echo.
pause

cd backend
echo.
echo [1/2] Seeding database...
echo.
node seed-comprehensive-data.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Seeding failed! Please check the error above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Seeding Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start the backend server:
echo    cd backend
echo    npm start
echo.
echo 2. Start the frontend (in a new terminal):
echo    cd frontend
echo    npm start
echo.
echo 3. Login with:
echo    Email: sohari@example.com
echo    Password: password123
echo.
echo 4. Test the features:
echo    - Browse home feed
echo    - See top 3 reactions beside like counts
echo    - Click reactions to add your own
echo    - View posts with images, videos, voice notes
echo    - Try polls, one-time posts, timed posts
echo    - Check City Radar for location posts
echo    - Visit WhisperWall for anonymous posts
echo.
pause
