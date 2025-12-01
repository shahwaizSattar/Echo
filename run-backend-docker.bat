@echo off
echo Starting Whisper Echo Backend with Docker...

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and make sure it's running
    pause
    exit /b 1
)

echo ✅ Docker is available

REM Check if .env file exists
if not exist "backend\.env" (
    echo ❌ Backend .env file not found
    echo Copying .env.docker to .env...
    copy "backend\.env.docker" "backend\.env"
    echo ⚠️  Please update backend\.env with your actual values
    pause
)

echo 🐳 Building and starting backend container...
docker-compose up --build -d

echo ✅ Backend is starting up...
echo 📍 Backend will be available at: http://localhost:5000
echo 📊 To view logs: docker-compose logs -f backend
echo 🛑 To stop: docker-compose down

echo.
echo Waiting for backend to be ready...
timeout /t 10 /nobreak >nul

REM Test if backend is responding
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running successfully!
) else (
    echo ⚠️  Backend is starting up, please wait a moment...
    echo Run 'docker-compose logs backend' to check status
)

pause