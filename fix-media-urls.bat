@echo off
echo ========================================
echo   Fix Media URLs in Database
echo ========================================
echo.
echo This will convert all absolute media URLs
echo to relative URLs so they work with any IP.
echo.
pause

cd backend
node fix-media-urls.js
cd ..

echo.
echo ========================================
echo   Done!
echo ========================================
pause
