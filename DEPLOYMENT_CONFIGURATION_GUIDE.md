# Deployment Configuration Guide

## Overview

When deploying your backend, you need to update the frontend configuration to point to your deployed backend URL instead of your local IP address.

## Deployment Scenarios

### 1. Railway Deployment (Recommended)

#### Backend Changes:
**No changes needed** - Railway automatically handles:
- `PORT` (provided by Railway)
- `SERVER_HOST` (handled automatically)
- `SERVER_IP` (not needed in production)

#### Frontend Changes:
Update `frontend/.env`:
```env
# Comment out local development settings
# EXPO_PUBLIC_SERVER_IP=172.20.10.2
# EXPO_PUBLIC_SERVER_PORT=5000

# Use your Railway deployment URL
EXPO_PUBLIC_API_BASE=https://your-app-name.up.railway.app
```

### 2. Render Deployment

#### Backend Changes:
**No changes needed** - Render handles hosting automatically.

#### Frontend Changes:
Update `frontend/.env`:
```env
# Use your Render deployment URL
EXPO_PUBLIC_API_BASE=https://your-app-name.onrender.com
```

### 3. Vercel Deployment

#### Backend Changes:
**No changes needed** - Vercel handles serverless deployment.

#### Frontend Changes:
Update `frontend/.env`:
```env
# Use your Vercel deployment URL
EXPO_PUBLIC_API_BASE=https://your-app-name.vercel.app
```

### 4. Heroku Deployment

#### Backend Changes:
**No changes needed** - Heroku provides `PORT` automatically.

#### Frontend Changes:
Update `frontend/.env`:
```env
# Use your Heroku app URL
EXPO_PUBLIC_API_BASE=https://your-app-name.herokuapp.com
```

## Quick Deployment Scripts

### For Railway (Current Setup)
```bash
# 1. Deploy backend to Railway (already done)
# 2. Update frontend configuration
echo "EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app" > frontend/.env.production

# 3. Build frontend for production
cd frontend
npm run build
```

### For Local Development vs Production

Create separate environment files:

#### `frontend/.env.development`
```env
# Local development
EXPO_PUBLIC_SERVER_IP=172.20.10.2
EXPO_PUBLIC_SERVER_PORT=5000
EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000
```

#### `frontend/.env.production`
```env
# Production deployment
EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app
```

## Automatic Environment Switching

The code already handles this automatically:

```typescript
// In api.ts and mediaUtils.ts
if (!__DEV__) {
  return 'https://whisperecho-backend-production.up.railway.app';
}
```

This means:
- **Development builds** use local IP configuration
- **Production builds** automatically use Railway URL

## Environment Variables for Different Platforms

### Backend Environment Variables (Production)
```env
# These are set automatically by hosting platforms
PORT=5000                    # Set by platform
NODE_ENV=production         # Set by platform
SERVER_HOST=0.0.0.0        # Default for containers

# These you need to set in platform dashboard
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
```

### Frontend Environment Variables

#### Development
```env
EXPO_PUBLIC_SERVER_IP=172.20.10.2
EXPO_PUBLIC_SERVER_PORT=5000
EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000
```

#### Production
```env
EXPO_PUBLIC_API_BASE=https://your-deployed-backend.com
```

## Step-by-Step Deployment Process

### 1. Backend Deployment (Railway)
```bash
# Already deployed at:
# https://whisperecho-backend-production.up.railway.app
```

### 2. Frontend Configuration Update
```bash
# For production build
echo "EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app" > frontend/.env.production

# Or update existing .env for production
cd frontend
cp .env .env.backup
echo "EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app" > .env
```

### 3. Test Production Configuration
```bash
# Test the production backend
curl https://whisperecho-backend-production.up.railway.app/health

# Should return: {"status":"OK",...}
```

### 4. Build and Deploy Frontend

#### For Expo/React Native App
```bash
cd frontend
npm run build
eas build --platform all
```

#### For Web Deployment
```bash
cd frontend
npm run build
# Deploy to Netlify, Vercel, or your preferred platform
```

## Configuration Management Scripts

### Switch to Production
```bash
# Create switch-to-production.bat
@echo off
echo Switching to production configuration...
cd frontend
copy .env .env.development.backup
echo EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app > .env
echo ✅ Switched to production configuration
echo Backend URL: https://whisperecho-backend-production.up.railway.app
```

### Switch to Development
```bash
# Create switch-to-development.bat
@echo off
echo Switching to development configuration...
cd frontend
copy .env .env.production.backup
echo EXPO_PUBLIC_SERVER_IP=172.20.10.2 > .env
echo EXPO_PUBLIC_SERVER_PORT=5000 >> .env
echo EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000 >> .env
echo ✅ Switched to development configuration
echo Backend URL: http://172.20.10.2:5000
```

## Current Deployment Status

Based on your existing files, you already have:
- ✅ Backend deployed on Railway: `https://whisperecho-backend-production.up.railway.app`
- ✅ Frontend configured for local development
- ✅ Automatic environment detection in code

## What You Need to Do Now

### For Production App Build:
1. **Update frontend/.env**:
   ```env
   EXPO_PUBLIC_API_BASE=https://whisperecho-backend-production.up.railway.app
   ```

2. **Build your app**:
   ```bash
   cd frontend
   npm run build
   ```

### For Development:
Keep your current configuration - it's already perfect!

## Testing Deployment

```bash
# Test production backend
curl https://whisperecho-backend-production.up.railway.app/health

# Test media files
curl https://whisperecho-backend-production.up.railway.app/uploads/images/test.jpg
```

## Important Notes

1. **No backend code changes needed** - your backend is deployment-ready
2. **Only frontend configuration changes** - just update the API URL
3. **Environment detection works automatically** - production builds will use the right URL
4. **Media URLs will work automatically** - they use the same base URL logic

The beauty of the centralized configuration is that deployment is now just a matter of changing one environment variable! 🚀