@echo off
echo Stopping Whisper Echo Backend Docker containers...

docker-compose down

echo ✅ Backend containers stopped
pause