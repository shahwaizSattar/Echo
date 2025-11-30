# 🚀 Build Your APK - Quick Start

## What You Need to Do (3 Main Steps)

### Step 1: Deploy Your Backend (15 minutes)

Your backend needs to be online so the APK can connect to it from anywhere.

**Easiest Option - Render (Free):**

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub (push your code first if needed)
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add these environment variables:
   ```
   MONGODB_URI=mongodb+srv://user:Acer.112@blog-app.zi3j2.mongodb.net/whisper-echo?retryWrites=true&w=majority&appName=blog-app
   JWT_SECRET=Acer.112
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=production
   ```
6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. Copy your backend URL (e.g., `https://whisperecho-backend.onrender.com`)

**Alternative - Quick Test with ngrok:**
```bash
# Start backend
cd backend
npm start

# In another terminal
npm install -g ngrok
ngrok http 5000
```
Copy the ngrok URL (but note: this is temporary and expires when you close terminal)

### Step 2: Update Frontend Configuration (2 minutes)

1. Open `frontend/.env`
2. Replace the URL with your deployed backend:
   ```env
   EXPO_PUBLIC_API_BASE=https://your-backend-url.onrender.com
   ```
3. Save the file

### Step 3: Build the APK (20 minutes)

**Option A - Use the Script (Easiest):**
```bash
# Just run this
build-apk.bat
```

**Option B - Manual Commands:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Go to frontend
cd frontend

# Install dependencies
npm install

# Login to Expo (create account at expo.dev if needed)
eas login

# Build APK
eas build --platform android --profile preview
```

The build happens in the cloud. You'll get an email with download link when done (15-20 min).

## After Build Completes

1. Download the APK from the link in your email
2. Transfer to your Android phone
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK
5. Open the app and test!

## Testing Checklist

- [ ] App opens without crashing
- [ ] Can register new account
- [ ] Can login
- [ ] Can create posts
- [ ] Can upload images
- [ ] WhisperWall works
- [ ] City Radar works
- [ ] Messaging works

## If Something Goes Wrong

### "Network Error" in the app
- Check if your backend URL is correct in `frontend/.env`
- Test backend in browser: `https://your-backend-url.com/health`
- Should show: `{"status":"OK"}`

### Build fails
- Check `eas build:list` for error logs
- Make sure you're logged in: `eas login`
- Verify `frontend/app.json` has no syntax errors

### Backend not accessible
- Check Render dashboard - is service running?
- Check environment variables are set correctly
- Look at Render logs for errors

## Useful Commands

```bash
# Check build status
eas build:list

# Download latest build
eas build:download

# View build details
eas build:view

# Test backend
curl https://your-backend-url.com/health
```

## Cost

- **Render Free Tier**: $0 (backend hosting)
- **EAS Build Free Tier**: Limited builds/month
- **Total for testing**: $0

For production:
- Render Starter: $7/month
- EAS Build: $29/month (unlimited builds)
- Google Play Store: $25 one-time

## Files Created for You

- ✅ `frontend/eas.json` - Build configuration
- ✅ `frontend/app.json` - Updated with permissions
- ✅ `backend/render.yaml` - Render deployment config
- ✅ `build-apk.bat` - Automated build script
- ✅ `APK_BUILD_GUIDE.md` - Detailed guide
- ✅ `APK_BUILD_CHECKLIST.md` - Complete checklist
- ✅ `DEPLOY_BACKEND_RENDER.md` - Backend deployment guide

## Quick Reference

### Backend URLs to Test
- Health: `/health`
- Test: `/api/test`
- Register: `/api/auth/register`
- Login: `/api/auth/login`

### Important Files
- Backend URL: `frontend/.env`
- App config: `frontend/app.json`
- Build config: `frontend/eas.json`

## Ready to Start?

1. **Deploy backend** → Get URL
2. **Update .env** → Add backend URL
3. **Run build-apk.bat** → Get APK

That's it! 🎉

---

**Need help?** Check the detailed guides:
- `APK_BUILD_GUIDE.md` - Complete build instructions
- `DEPLOY_BACKEND_RENDER.md` - Backend deployment details
- `APK_BUILD_CHECKLIST.md` - Step-by-step checklist
