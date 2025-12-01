@echo off
echo ========================================
echo Testing Local Backend Server
echo ========================================
echo.

echo Test 1: Health Check...
curl -s http://localhost:5000/health
echo.
echo.

echo Test 2: API Test Endpoint...
curl -s http://localhost:5000/api/test
echo.
echo.

echo Test 3: Network Access (from phone)...
echo Your phone should access: http://192.168.10.2:5000/health
echo.

echo ========================================
echo Tests Complete!
echo ========================================
echo.
echo If all tests passed, your backend is ready!
echo.
pause
