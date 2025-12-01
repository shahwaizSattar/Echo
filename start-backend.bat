@echo off
echo ========================================
echo Starting WhisperEcho Backend Server
echo ========================================
echo.

cd backend

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)

echo.
echo ========================================
echo Starting server on port 5000...
echo Backend will be available at:
echo   - Local: http://localhost:5000
echo   - Network: http://192.168.10.2:5000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
