@echo off
echo.
echo ========================================
echo   Comprehensive Database Seeding
echo ========================================
echo.
echo This will:
echo - Clear existing data
echo - Create 5 dummy users (including sohari)
echo - Create various post types with media
echo - Add reactions and comments
echo - Create WhisperWall posts
echo.
echo Press Ctrl+C to cancel, or
pause

node seed-comprehensive-data.js

echo.
echo ========================================
echo   Seeding Complete!
echo ========================================
echo.
pause
