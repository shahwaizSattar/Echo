# APK Build - Quick Reference Card

## 🎯 Three Steps to APK

### 1️⃣ Deploy Backend (15 min)
```
Render.com → New Web Service → Connect GitHub
→ Root: backend → npm install → npm start
→ Add env vars → Deploy → Copy URL
```

### 2️⃣ Update Config (2 min)
```
Edit: frontend/.env
Change: EXPO_PUBLIC_API_BASE=https://your-backend-url.com
Save
```

### 3️⃣ Build APK (20 min)
```bash
cd frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## 📋 Essential Commands

```bash
# Build APK
eas build -p android --profile preview

# Check status
eas build:list

# Download APK
eas build:download

# Test backend
curl https://your-backend-url.com/health

# View logs
eas build:view
```

## 🔧 Files to Edit

| File | What to Change | Example |
|------|----------------|---------|
| `frontend/.env` | Backend URL | `EXPO_PUBLIC_API_BASE=https://...` |
| `frontend/app.json` | Version number | `"version": "1.0.1"` |
| `frontend/app.json` | Version code | `"versionCode": 2` |

## 🌐 Backend Deployment Options

| Service | Cost | Speed | Difficulty |
|---------|------|-------|------------|
| Render | Free | Medium | Easy ⭐⭐⭐ |
| Railway | $5/mo | Fast | Easy ⭐⭐⭐ |
| ngrok | Free | Instant | Very Easy ⭐ |
| Heroku | $7/mo | Fast | Medium ⭐⭐ |

## ✅ Testing Checklist

```
□ Backend health check works
□ APK installs on device
□ App opens without crash
□ Registration works
□ Login works
□ Create post works
□ Upload image works
□ WhisperWall works
□ City Radar works
□ Messaging works
```

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Network Error | Check backend URL in .env |
| Build Failed | Run `eas build:list` for logs |
| App Crashes | Check permissions in app.json |
| Can't Login | Test backend: `/api/auth/login` |
| No Posts | Test backend: `/api/posts` |

## 📞 Support Resources

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Render Docs**: https://render.com/docs
- **Your Guides**: 
  - `BUILD_APK_NOW.md` - Quick start
  - `APK_BUILD_GUIDE.md` - Detailed guide
  - `APK_BUILD_CHECKLIST.md` - Full checklist

## 🎯 Environment Variables (Backend)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
```

## 📱 App Permissions (app.json)

```json
"permissions": [
  "CAMERA",
  "RECORD_AUDIO",
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION",
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE"
]
```

## 🔄 Update & Rebuild

```bash
# 1. Make changes to code
# 2. Update version in app.json
# 3. Rebuild
cd frontend
eas build -p android --profile preview
```

## 💰 Cost Estimate

**Free Tier (Testing):**
- Render: $0
- EAS Build: Limited free builds
- **Total: $0**

**Production:**
- Render: $7/mo
- EAS Build: $29/mo
- Play Store: $25 one-time
- **Total: ~$40 first month, $36/mo after**

## ⏱️ Time Estimates

| Task | First Time | Subsequent |
|------|------------|------------|
| Backend Deploy | 15 min | 5 min |
| Update Config | 2 min | 1 min |
| Build APK | 20 min | 20 min |
| Test | 15 min | 10 min |
| **Total** | **52 min** | **36 min** |

## 🎨 Build Profiles

```json
{
  "preview": {
    "android": {
      "buildType": "apk"  // For testing
    }
  },
  "production": {
    "android": {
      "buildType": "app-bundle"  // For Play Store
    }
  }
}
```

## 📦 What Gets Built

```
Your Code → Expo Servers → APK File
├─ React Native app
├─ All dependencies
├─ Assets (images, icons)
├─ Native modules
└─ App configuration
```

## 🎉 Success Indicators

✅ Build completes without errors
✅ Download link received via email
✅ APK installs on device
✅ App opens and loads
✅ Can connect to backend
✅ All features work

---

**Start Now:** Run `build-apk.bat` or follow `BUILD_APK_NOW.md`
