@echo off
echo 🔍 IP Configuration Verification
echo.

echo 📋 Current Configuration:
echo.

echo Backend (.env):
if exist backend\.env (
    findstr "SERVER_IP" backend\.env
    findstr "PORT" backend\.env
) else (
    echo ❌ backend\.env not found
)

echo.
echo Frontend (.env):
if exist frontend\.env (
    findstr "EXPO_PUBLIC_SERVER_IP" frontend\.env
    findstr "EXPO_PUBLIC_SERVER_PORT" frontend\.env
    findstr "EXPO_PUBLIC_API_BASE" frontend\.env
) else (
    echo ❌ frontend\.env not found
)

echo.
echo 🧪 Testing Backend Connection:
for /f "tokens=2 delims==" %%i in ('findstr "SERVER_IP" backend\.env 2^>nul') do set SERVER_IP=%%i
for /f "tokens=2 delims==" %%i in ('findstr "PORT" backend\.env 2^>nul') do set SERVER_PORT=%%i

if defined SERVER_IP if defined SERVER_PORT (
    echo Testing: http://%SERVER_IP%:%SERVER_PORT%/health
    curl -s http://%SERVER_IP%:%SERVER_PORT%/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend is accessible
    ) else (
        echo ❌ Backend is not accessible
        echo Make sure the backend server is running
    )
) else (
    echo ⚠️ Could not determine server IP/port from configuration
)

echo.
echo 📱 Platform URLs:
echo Web: http://%SERVER_IP%:%SERVER_PORT%
echo Android Emulator: http://10.0.2.2:%SERVER_PORT%
echo iOS/Physical: http://%SERVER_IP%:%SERVER_PORT%