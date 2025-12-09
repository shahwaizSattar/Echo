@echo off
echo.
echo ========================================
echo   Seed Messages and Notifications
echo ========================================
echo.
echo This will create:
echo - Conversations with text, image, video, and audio messages
echo - Reaction notifications
echo - Comment notifications
echo.
echo Note: Run seed-comprehensive-data.js first if you haven't!
echo.
pause

node seed-messages-notifications.js

echo.
echo ========================================
echo   Seeding Complete!
echo ========================================
echo.
pause
