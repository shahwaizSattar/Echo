@echo off
echo ========================================
echo   Switching to Production Configuration
echo ========================================
echo.

echo Backing up current .env file...
copy frontend\.env frontend\.env.development

echo.
echo Switching to production configuration...
copy frontend\.env.production frontend\.env

echo.
echo ========================================
echo   Production Configuration Active
echo ========================================
echo API Base: https://echo-yddc.onrender.com
echo Server: echo-yddc.onrender.com:443
echo.
echo To switch back to development:
echo   run switch-to-development.bat
echo.
pause