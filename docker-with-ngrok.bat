@echo off
echo Starting Docker Backend with Public URL...

REM Start Docker backend
echo 🐳 Starting Docker backend...
docker-compose up -d --build

REM Wait for backend to be ready
echo ⏳ Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Check if ngrok is installed
ngrok --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ngrok not installed
    echo Please install ngrok from: https://ngrok.com/download
    echo Then run: ngrok config add-authtoken YOUR_TOKEN
    pause
    exit /b 1
)

echo 🌐 Creating public tunnel...
echo Your backend will be available at a public URL
echo Keep this window open to maintain the tunnel
echo.
echo 📱 Use the ngrok URL in your APK build
echo.

REM Start ngrok tunnel
ngrok http 5000