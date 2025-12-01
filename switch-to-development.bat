@echo off
echo ========================================
echo   Switching to Development Configuration  
echo ========================================
echo.

echo Switching to development configuration...
if exist frontend\.env.development (
    copy frontend\.env.development frontend\.env
    echo Development configuration restored.
) else (
    echo # API Configuration > frontend\.env
    echo # Local backend for development - Use IP address for mobile devices >> frontend\.env
    echo EXPO_PUBLIC_SERVER_IP=172.20.10.2 >> frontend\.env
    echo EXPO_PUBLIC_SERVER_PORT=5000 >> frontend\.env
    echo EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000 >> frontend\.env
    echo Development configuration created.
)

echo.
echo ========================================
echo   Development Configuration Active
echo ========================================
echo API Base: http://172.20.10.2:5000
echo Server: 172.20.10.2:5000
echo.
echo To switch back to production:
echo   run switch-to-production.bat
echo.
pause