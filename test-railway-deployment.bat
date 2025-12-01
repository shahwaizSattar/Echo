@echo off
echo Testing Railway Deployment...

echo 🔍 Testing health endpoint...
curl -s https://whisperecho-backend-production.up.railway.app/health

echo.
echo 🔍 Testing API endpoint...
curl -s https://whisperecho-backend-production.up.railway.app/api/test

echo.
echo ✅ If you see responses above, your Railway deployment is working!
echo 📱 Your APK can use: https://whisperecho-backend-production.up.railway.app
pause