# APK Build Checklist

## Pre-Build Checklist

### Backend Deployment
- [ ] Backend code is ready and tested locally
- [ ] MongoDB connection string is valid
- [ ] Choose deployment platform (Render/Railway/Heroku)
- [ ] Deploy backend to cloud
- [ ] Test backend endpoints via browser/Postman
- [ ] Note down your backend URL (e.g., `https://your-app.onrender.com`)

### Frontend Configuration
- [ ] Update `frontend/.env` with deployed backend URL
- [ ] Verify `frontend/app.json` has correct package name
- [ ] Check all required permissions are listed in `app.json`
- [ ] Ensure app icons exist in `frontend/assets/`
- [ ] Test app locally with deployed backend: `npm start`

### Expo/EAS Setup
- [ ] Node.js is installed (v16 or higher)
- [ ] Expo account created at https://expo.dev
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`

## Build Process

### Option A: Automated Build (Recommended)
```bash
# Run the build script
build-apk.bat
```

### Option B: Manual Build
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure

# Build APK
eas build --platform android --profile preview
```

## Post-Build Checklist

### Download & Install
- [ ] Build completed successfully
- [ ] Download APK from EAS dashboard or email link
- [ ] Transfer APK to Android device
- [ ] Enable "Install from Unknown Sources" on device
- [ ] Install APK

### Testing on Device
- [ ] App opens without crashing
- [ ] Registration works
- [ ] Login works
- [ ] Can create text posts
- [ ] Can upload images
- [ ] Can record and play voice notes
- [ ] WhisperWall feature works
- [ ] City Radar feature works
- [ ] Location services work
- [ ] Messaging works
- [ ] Avatar customization works
- [ ] Theme switching works
- [ ] Profile viewing works
- [ ] Search functionality works
- [ ] Notifications work
- [ ] All media (images/videos/audio) display correctly

### Network Testing
- [ ] Test on WiFi
- [ ] Test on mobile data
- [ ] Test with poor connection
- [ ] Verify error messages are user-friendly

## Troubleshooting

### Build Fails
1. Check `eas build:list` for error logs
2. Verify `app.json` syntax is correct
3. Ensure all assets exist
4. Check package.json dependencies

### APK Installs but Crashes
1. Check if backend URL is correct in `.env`
2. Verify backend is accessible
3. Check Android permissions in `app.json`
4. Test on different Android versions

### Network Errors in APK
1. Verify backend is deployed and running
2. Test backend URL in browser
3. Check if CORS is enabled on backend
4. Ensure `.env` file was updated before build

### Features Not Working
1. Check if backend endpoints are accessible
2. Verify MongoDB connection
3. Check backend logs for errors
4. Test API endpoints with Postman

## Production Build (For Play Store)

When ready for production:

```bash
cd frontend
eas build --platform android --profile production
```

This creates an AAB (Android App Bundle) for Google Play Store.

### Play Store Requirements
- [ ] App icons (512x512 for store listing)
- [ ] Screenshots (at least 2)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Content rating questionnaire completed
- [ ] Developer account ($25 one-time fee)

## Quick Reference Commands

```bash
# Check build status
eas build:list

# Download latest build
eas build:download

# View build logs
eas build:view

# Cancel build
eas build:cancel

# Update app version
# Edit frontend/app.json, increment version and versionCode
```

## Support Resources

- Expo Documentation: https://docs.expo.dev
- EAS Build Guide: https://docs.expo.dev/build/introduction/
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

## Estimated Timeline

- Backend deployment: 10-15 minutes
- First APK build: 15-20 minutes
- Testing: 30-60 minutes
- **Total**: ~1-2 hours for first complete build

## Cost Breakdown

### Free Tier (Recommended for Testing)
- Render: Free (with limitations)
- Railway: $5 credit/month free
- EAS Build: Limited free builds/month
- **Total**: $0-5/month

### Production (Recommended for Launch)
- Render: $7/month (Starter plan)
- Railway: ~$5-10/month (usage-based)
- EAS Build: $29/month (unlimited builds)
- Google Play Store: $25 (one-time)
- **Total**: ~$40-50 first month, ~$15-40/month after

## Next Steps After APK

1. Test thoroughly on multiple devices
2. Gather feedback from beta testers
3. Fix any bugs found
4. Prepare Play Store listing
5. Submit to Google Play Store
6. Market your app!

---

**Ready to build?** Run `build-apk.bat` or follow the manual steps above!
