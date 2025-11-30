@echo off
echo ========================================
echo Backend Connection Test
echo ========================================
echo.

set /p BACKEND_URL="Enter your backend URL (e.g., https://your-app.onrender.com): "

echo.
echo Testing connection to: %BACKEND_URL%
echo.

echo Test 1: Health Check
echo ---------------------
curl -s %BACKEND_URL%/health
echo.
echo.

echo Test 2: API Test Endpoint
echo --------------------------
curl -s %BACKEND_URL%/api/test
echo.
echo.

echo Test 3: Posts Endpoint
echo -----------------------
curl -s %BACKEND_URL%/api/posts
echo.
echo.

echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If you see JSON responses above, your backend is working!
echo If you see errors, check:
echo   1. Backend is deployed and running
echo   2. URL is correct (no trailing slash)
echo   3. Environment variables are set
echo.
pause
