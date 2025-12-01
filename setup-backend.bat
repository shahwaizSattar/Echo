@echo off
echo ========================================
echo WhisperEcho Backend Setup
echo ========================================
echo.

cd backend

echo Step 1: Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 3: Creating uploads directories...
if not exist "uploads\" mkdir uploads
if not exist "uploads\images\" mkdir uploads\images
if not exist "uploads\videos\" mkdir uploads\videos
if not exist "uploads\audio\" mkdir uploads\audio
echo ✓ Upload directories created

echo.
echo Step 4: Checking .env file...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create a .env file with your configuration.
) else (
    echo ✓ .env file exists
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend server, run:
echo   start-backend.bat
echo.
pause
