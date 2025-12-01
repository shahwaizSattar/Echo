# Railway Deployment Guide

## Quick Fix for "Cannot find module '/app/server.js'" Error

The error occurs because Railway tries to run `node server.js` from the root, but your server is in the `backend` folder.

## Solution Applied ✅

I've created a **wrapper file** at the root that redirects to your backend server:

### 1. `server.js` (Root Level)
A simple wrapper that requires the actual server from the backend folder. Railway will now find this file and it will automatically load your backend server.

### 2. `nixpacks.toml`
Tells Railway how to install dependencies for both root and backend folders.

### 3. Updated `package.json`
Added a `postinstall` script to automatically install backend dependencies.

## Railway Configuration Steps

### Option A: Using Railway Dashboard (Easiest)

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Settings** tab
4. Scroll to **Deploy** section
5. Set these values:
   - **Root Directory**: Leave empty or set to `/`
   - **Start Command**: `cd backend && node server.js`
   - **Install Command**: `npm install && cd backend && npm install`

### Option B: Using Railway CLI

```bash
# Set the start command
railway run --command "cd backend && node server.js"
```

## Environment Variables Required

Make sure these are set in Railway:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
NODE_ENV=production
PORT=5000
```

## Verify Deployment

After deployment, check:

1. **Build Logs**: Should show successful npm install in backend folder
2. **Deploy Logs**: Should show "🚀 Server running on port 5000"
3. **Health Check**: Visit `https://your-app.railway.app/health`

## Common Issues

### Issue: Module not found errors
**Solution**: Make sure `postinstall` script runs or manually set install command

### Issue: MongoDB connection fails
**Solution**: 
- Verify MONGODB_URI is set correctly
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Railway)

### Issue: Port binding error
**Solution**: Railway automatically sets PORT env variable, your server already handles this

## Testing Your Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Test API endpoint
curl https://your-app.railway.app/api/test
```

## Redeploy

After making these changes:

1. Commit and push to your repository
2. Railway will automatically redeploy
3. Or manually trigger redeploy from Railway dashboard

## Alternative: Deploy Backend Only

If you want to deploy just the backend folder:

1. In Railway dashboard, go to Settings
2. Set **Root Directory** to `backend`
3. Set **Start Command** to `node server.js`
4. Set **Install Command** to `npm install`

This way Railway will treat the backend folder as the root of your application.
