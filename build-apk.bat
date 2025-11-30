@echo off
echo ========================================
echo WhisperEcho APK Build Script
echo ========================================
echo.

echo Step 1: Checking if EAS CLI is installed...
call eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
) else (
    echo EAS CLI is already installed.
)
echo.

echo Step 2: Navigating to frontend directory...
cd frontend
echo.

echo Step 3: Installing dependencies...
call npm install
echo.

echo Step 4: Checking backend URL configuration...
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create frontend/.env with your backend URL:
    echo EXPO_PUBLIC_API_BASE=https://your-backend-url.com
    pause
    exit /b 1
)
echo Backend configuration found.
echo.

echo Step 5: Logging into Expo...
echo Please login with your Expo account:
call eas login
echo.

echo Step 6: Building APK...
echo This will build your APK in the cloud.
echo You'll receive a download link when complete.
echo.
call eas build --platform android --profile preview
echo.

echo ========================================
echo Build process initiated!
echo ========================================
echo.
echo Next steps:
echo 1. Wait for the build to complete (check your email)
echo 2. Download the APK from the link provided
echo 3. Install on your Android device
echo 4. Test all features
echo.
echo To check build status: eas build:list
echo To download build: eas build:download
echo.
pause
