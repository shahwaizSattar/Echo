@echo off
echo ========================================
echo   Deploying Voice Note Fixes to Render
echo ========================================
echo.

echo 1. Adding all changes to Git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Fix voice note playback and media URL construction - Updated playVoiceNote functions to use getFullMediaUrl() - Fixed voice note URLs in database - Added proper URL construction for all media types - Improved error handling and debugging"

echo.
echo 3. Pushing to repository...
git push origin main

echo.
echo 4. Deployment initiated!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Wait 5-10 minutes for Render to deploy
echo 2. Check deployment status at: https://dashboard.render.com
echo 3. Run the production URL fix script (see RENDER_DEPLOYMENT_COMPLETE.md)
echo 4. Update frontend/.env with production URL
echo 5. Test voice notes and media loading
echo.
echo Deployment URL: https://echo-yddc.onrender.com
echo.
pause