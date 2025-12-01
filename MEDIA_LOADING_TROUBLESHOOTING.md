# Media Loading Troubleshooting Guide

## Issue Fixed: IP Address Mismatch

### Problem
The frontend was trying to load media from `192.168.10.2:5000` but the backend is running on `172.20.10.2:5000`.

### Root Cause
1. **Database URLs**: Media URLs stored in the database had the old IP address
2. **Hard-coded IPs**: Some backend files had hard-coded old IP addresses
3. **Browser Cache**: The frontend might be caching old environment variables

### Fixes Applied

#### 1. Database URL Update ✅
- Updated 6 regular posts with old IP addresses
- Updated 3 whisper posts with old IP addresses
- All media URLs now point to `172.20.10.2:5000`

#### 2. Backend Configuration ✅
- Fixed hard-coded IP in `backend/server.js`
- Updated example environment file
- Verified backend is accessible at correct IP

#### 3. Frontend Configuration ✅
- Environment file already correct: `EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000`
- Media utility configured correctly
- Added debug logging to track URL construction

### Next Steps

#### For Web Browser Users:
1. **Hard refresh the browser**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache**: 
   - Chrome: Settings > Privacy > Clear browsing data
   - Firefox: Settings > Privacy > Clear Data
3. **Restart development server**: Run `restart-frontend.bat`

#### For Mobile App Users:
1. **Restart the Expo app**
2. **Clear Expo cache**: Delete `.expo` folder in frontend directory
3. **Restart development server**

### Verification Steps

1. **Check backend accessibility**:
   ```bash
   curl http://172.20.10.2:5000/health
   ```

2. **Test media file access**:
   ```bash
   curl http://172.20.10.2:5000/uploads/images/test-image.jpg
   ```

3. **Verify environment variables**:
   - Check `frontend/.env` contains `EXPO_PUBLIC_API_BASE=http://172.20.10.2:5000`
   - Look for debug logs in browser console showing correct URL construction

### Debug Information

The media utility now logs URL construction:
```
🔧 Media Utils Initialized
📡 MEDIA_BASE_URL: http://172.20.10.2:5000
🌍 Environment: Development
📱 Platform: web
🔗 Media URL constructed: /uploads/images/test.jpg -> http://172.20.10.2:5000/uploads/images/test.jpg
```

### Common Issues

1. **Still seeing old IP in errors**:
   - Clear browser cache completely
   - Restart development server
   - Check for any remaining hard-coded IPs

2. **Media not loading on mobile**:
   - Ensure mobile device is on same network
   - Check firewall settings
   - Verify IP address is correct for your network

3. **Environment variables not updating**:
   - Restart development server
   - Clear `.expo` cache folder
   - Verify `.env` file is in correct location

### Files Updated

- ✅ `backend/server.js` - Fixed hard-coded IP
- ✅ `frontend/.env.example` - Updated example IP
- ✅ `backend/fix-media-urls-db.js` - Database migration script
- ✅ `frontend/src/utils/mediaUtils.ts` - Added debug logging
- ✅ Database records - Updated all media URLs

### Success Indicators

- ✅ Backend health check responds at `http://172.20.10.2:5000/health`
- ✅ Media files accessible at `http://172.20.10.2:5000/uploads/...`
- ✅ Database URLs updated to new IP
- ✅ No more `ERR_CONNECTION_TIMED_OUT` errors
- ✅ Images, videos, and audio loading properly