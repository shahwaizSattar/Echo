@echo off
echo 🔧 Switching to Development Configuration
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
if exist .env copy .env .env.production.backup >nul

echo 🔧 Setting development configuration...
echo # Development Configuration > .env
echo # Local backend for development - Use IP address for mobile devices >> .env
echo EXPO_PUBLIC_SERVER_IP=172.20.10.2 >> .env
echo EXPO_PUBLIC_SERVER_PORT=5000 >> .env
echo EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000 >> .env

echo.
echo ✅ Switched to development configuration!
echo 🏠 Backend URL: http://172.20.10.2:5000
echo.
echo 🧪 Testing local backend...
curl -s http://172.20.10.2:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Local backend is accessible
) else (
    echo ❌ Local backend is not accessible
    echo Make sure to start your backend server:
    echo   cd backend
    echo   npm run dev
)

echo.
echo 📱 Ready for development:
echo   npm start