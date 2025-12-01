@echo off
echo 🔄 Restarting frontend with updated environment...
echo.

cd frontend

echo 📋 Current environment:
type .env
echo.

echo 🧹 Clearing any cached environment...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .expo rmdir /s /q .expo

echo 🚀 Starting frontend development server...
echo 📱 Make sure to hard refresh your browser (Ctrl+F5) to clear cache
echo.

npm start