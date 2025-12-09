# Media URL Fix Guide

## Problem

Media uploaded with one IP address stops loading when you change to a different IP. This happens because the old system stored **absolute URLs** with the IP address hardcoded in MongoDB.

### Example of the Problem:
```javascript
// Old (broken when IP changes):
"url": "http://192.168.1.5:5000/uploads/images/photo.jpg"

// New (works with any IP):
"url": "/uploads/images/photo.jpg"
```

## Solution

We've fixed the system in two parts:

### 1. Future Uploads (Already Fixed)
- Modified `backend/middleware/upload.js` to store **relative URLs** instead of absolute URLs
- All new media uploads will now work with any IP address

### 2. Existing Media (Needs Migration)
- Run the migration script to convert old absolute URLs to relative URLs

## How to Fix Your Existing Media

### Step 1: Run the Fix Script

**Option A - Using Batch File (Easiest):**
```bash
fix-media-urls.bat
```

**Option B - Manual Command:**
```bash
cd backend
node fix-media-urls.js
```

### Step 2: Verify the Fix

The script will:
- ✅ Convert all Post media URLs
- ✅ Convert all Chat message media URLs  
- ✅ Convert all WhisperPost media URLs
- ✅ Convert all User avatar URLs

You'll see output like:
```
✅ Connected to MongoDB

📝 Fixing Post media URLs...
  Converting: http://192.168.1.5:5000/uploads/images/abc.jpg -> /uploads/images/abc.jpg
✅ Fixed 15 posts

💬 Fixing Chat message media URLs...
  Converting: http://192.168.1.5:5000/uploads/images/xyz.jpg -> /uploads/images/xyz.jpg
✅ Fixed 8 conversations

🔮 Fixing WhisperPost media URLs...
✅ Fixed 3 whisper posts

👤 Fixing User avatar URLs...
✅ Fixed 2 user avatars

🎉 All media URLs have been converted to relative paths!
📱 Your media will now work with any IP address.
```

### Step 3: Test Your App

1. Restart your backend if it's running
2. Open your app
3. Check that all previously uploaded media now loads correctly
4. Try changing IP addresses - media should still work!

## How It Works Now

### Frontend (Already Working)
The frontend's `getFullMediaUrl()` function in `frontend/src/utils/mediaUtils.ts` automatically constructs full URLs:

```javascript
// MongoDB stores: "/uploads/images/photo.jpg"
// Frontend creates: "http://YOUR_CURRENT_IP:5000/uploads/images/photo.jpg"

export const getFullMediaUrl = (mediaUrl: string): string => {
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl; // Already absolute
  }
  
  if (mediaUrl.startsWith('/uploads/')) {
    return `${MEDIA_BASE_URL}${mediaUrl}`; // Construct full URL
  }
  
  return mediaUrl;
};
```

### Backend (Now Fixed)
The upload middleware now returns relative URLs:

```javascript
// Old:
const getFileUrl = (req, filename, folder) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

// New:
const getFileUrl = (req, filename, folder) => {
  return `/uploads/${folder}/${filename}`;
};
```

## Benefits

✅ **IP Independence**: Change IPs anytime without breaking media  
✅ **Domain Flexibility**: Works with localhost, LAN IPs, or production domains  
✅ **Deployment Ready**: Same database works in dev and production  
✅ **No Re-uploads**: All existing media continues to work  

## Troubleshooting

### Media Still Not Loading?

1. **Check if script ran successfully:**
   - Look for "🎉 All media URLs have been converted" message
   - Verify no errors in the output

2. **Verify database connection:**
   - Make sure `backend/.env` has correct `MONGODB_URI`
   - Check MongoDB is running

3. **Check frontend configuration:**
   - Verify `frontend/.env` has correct `EXPO_PUBLIC_SERVER_IP`
   - Run `set-ip.bat` to update IP if needed

4. **Restart everything:**
   ```bash
   # Stop backend
   # Stop frontend
   # Run fix script again
   fix-media-urls.bat
   # Start backend
   # Start frontend
   ```

### Script Errors?

**"Cannot find module":**
```bash
cd backend
npm install
node fix-media-urls.js
```

**"Connection refused":**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`

## What Gets Fixed

| Collection | Field | Example |
|------------|-------|---------|
| Posts | `content.media[].url` | Post images/videos |
| Posts | `content.voiceNote.url` | Voice notes |
| Conversations | `messages[].media[].url` | Chat media |
| WhisperPosts | `content.media[].url` | Whisper media |
| Users | `avatar` | Profile pictures |

## Summary

Your media is **saved in MongoDB** (metadata) and **server disk** (files). The problem was that MongoDB stored URLs with the old IP address. Now:

1. ✅ **New uploads** automatically use relative URLs
2. ✅ **Old uploads** can be fixed with the migration script
3. ✅ **Frontend** dynamically constructs full URLs based on current IP
4. ✅ **Media persists** across IP changes and server restarts

Run `fix-media-urls.bat` once, and you're all set! 🎉
