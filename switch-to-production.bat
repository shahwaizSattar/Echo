@echo off
echo 🚀 Switching to Production Configuration
echo.

cd frontend

echo 📋 Current configuration:
if exist .env (
    findstr "EXPO_PUBLIC_API_BASE" .env
) else (
    echo No .env file found
)

echo.
echo 💾 Backing up current configuration...
if exist .env copy .env .env.development.backup >nul

echo 🔧 Setting production configuration...
echo # Production Configuration > .env
echo EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app >> .env

echo.
echo ✅ Switched to production configuration!
echo 🌐 Backend URL: https://whisperecho-backend-production.up.railway.app
echo.
echo 🧪 Testing production backend...
curl -s https://whisperecho-backend-production.up.railway.app/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Production backend is accessible
) else (
    echo ❌ Production backend is not accessible
    echo Please check your internet connection or backend deployment
)

echo.
echo 📱 Ready for production build:
echo   npm run build
echo   eas build --platform all