# APK Build Guide for WhisperEcho App

## Overview
This guide will help you build a functional APK with both frontend and backend working together.

## Prerequisites
- Node.js installed
- Expo CLI installed (`npm install -g expo-cli` or `npm install -g eas-cli`)
- Android Studio (optional, for local builds)
- Expo account (for EAS Build)

## Important: Backend Deployment

⚠️ **Critical**: For the APK to work on any device, your backend must be accessible via the internet, not just localhost or local IP.

### Option 1: Deploy Backend to Cloud (Recommended)
Deploy your backend to one of these services:
- **Render** (Free tier available) - https://render.com
- **Railway** (Free tier available) - https://railway.app
- **Heroku** (Paid)
- **DigitalOcean** (Paid)
- **AWS/Azure/GCP** (Paid)

### Option 2: Use ngrok for Testing (Temporary)
For testing purposes only:
```bash
# Install ngrok
npm install -g ngrok

# Run your backend first
cd backend
npm start

# In another terminal, expose it
ngrok http 5000
```
This gives you a public URL like `https://abc123.ngrok.io`

## Step-by-Step APK Build Process

### Step 1: Update Backend URL

1. Get your deployed backend URL (e.g., `https://your-app.onrender.com`)
2. Update `frontend/.env`:
```env
EXPO_PUBLIC_API_BASE=https://your-backend-url.com
```

### Step 2: Update app.json Configuration

Update `frontend/app.json` with proper build settings:
```json
{
  "expo": {
    "name": "WhisperEcho",
    "slug": "whisperecho",
    "version": "1.0.0",
    "android": {
      "package": "com.whisperecho.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### Step 3: Build APK Using EAS Build (Recommended)

```bash
# Navigate to frontend
cd frontend

# Install EAS CLI if not installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

The build will happen in the cloud and you'll get a download link for your APK.

### Step 4: Alternative - Local Build (Advanced)

If you want to build locally:

```bash
cd frontend

# Install dependencies
npm install

# Build locally (requires Android SDK)
npx expo run:android --variant release
```

## Build Profiles

Create `frontend/eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Testing Your APK

1. Download the APK from EAS Build
2. Transfer to your Android device
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK
5. Test all features:
   - User registration/login
   - Creating posts
   - WhisperWall
   - City Radar
   - Messaging
   - Avatar customization

## Backend Deployment Guide (Render Example)

### Deploy to Render:

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: whisperecho-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables from `backend/.env`
6. Click "Create Web Service"
7. Wait for deployment (you'll get a URL like `https://whisperecho-backend.onrender.com`)

### Update Frontend to Use Deployed Backend:

```bash
# Update frontend/.env
EXPO_PUBLIC_API_BASE=https://whisperecho-backend.onrender.com
```

## Common Issues & Solutions

### Issue 1: "Network Error" in APK
**Solution**: Backend URL is not accessible. Ensure backend is deployed and URL is correct.

### Issue 2: "Unable to connect to server"
**Solution**: Check if backend is running and accessible via the URL in `.env`

### Issue 3: Build fails with "AAPT error"
**Solution**: Check app.json for invalid characters or missing assets

### Issue 4: APK installs but crashes
**Solution**: Check if all required permissions are in app.json

## Production Checklist

Before releasing to users:

- [ ] Backend deployed to reliable hosting
- [ ] Environment variables properly set
- [ ] All features tested on APK
- [ ] Proper error handling for network issues
- [ ] App icons and splash screen configured
- [ ] Version number updated in app.json
- [ ] Privacy policy and terms of service ready
- [ ] Google Play Store listing prepared (if publishing)

## Quick Commands Reference

```bash
# Build APK (cloud)
cd frontend && eas build -p android --profile preview

# Build for Play Store (AAB)
cd frontend && eas build -p android --profile production

# Check build status
eas build:list

# Download latest build
eas build:download
```

## Next Steps

1. Deploy backend to cloud service
2. Update frontend/.env with backend URL
3. Run `eas build -p android --profile preview`
4. Download and test APK
5. If everything works, build production version for Play Store

## Support

If you encounter issues:
1. Check backend is accessible via browser
2. Verify .env file has correct URL
3. Check Expo build logs: `eas build:list`
4. Test on multiple devices
