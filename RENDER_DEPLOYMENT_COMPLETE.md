# Deploy Voice Note Fixes to Render - Complete Guide

## Current Status
- **Render Backend URL**: https://echo-yddc.onrender.com
- **Issue**: Voice notes and media not working due to outdated code
- **Solution**: Deploy the voice note fixes we just implemented

## Step 1: Commit and Push Changes

### Add All Changes
```bash
git add .
git commit -m "Fix voice note playback and media URL construction

- Updated playVoiceNote functions to use getFullMediaUrl()
- Fixed voice note URLs in database
- Added proper URL construction for all media types
- Improved error handling and debugging"
```

### Push to Repository
```bash
git push origin main
```

## Step 2: Render Auto-Deploy
Render should automatically deploy when you push to the main branch. Check the deployment status at:
- https://dashboard.render.com/web/srv-YOUR-SERVICE-ID

## Step 3: Update Database URLs on Production

After deployment, run the media URL fix script on production database:

### Create Production URL Fix Script
```javascript
// backend/fix-production-urls.js
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');

const OLD_URLS = [
  'http://192.168.10.13:5000',
  'http://172.20.10.2:5000',
  'http://localhost:5000'
];
const NEW_URL = 'https://echo-yddc.onrender.com';

async function fixProductionUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to production database');
    
    for (const oldUrl of OLD_URLS) {
      const posts = await Post.find({
        $or: [
          { 'content.media.url': { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
          { 'content.image': { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } },
          { 'content.voiceNote.url': { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }
        ]
      });
      
      console.log(`Found ${posts.length} posts with ${oldUrl}`);
      
      for (const post of posts) {
        let updated = false;
        
        // Fix media URLs
        if (post.content.media) {
          post.content.media.forEach(media => {
            if (media.url && media.url.includes(oldUrl)) {
              media.url = media.url.replace(oldUrl, NEW_URL);
              updated = true;
            }
          });
        }
        
        // Fix image URL
        if (post.content.image && post.content.image.includes(oldUrl)) {
          post.content.image = post.content.image.replace(oldUrl, NEW_URL);
          updated = true;
        }
        
        // Fix voice note URL
        if (post.content.voiceNote?.url && post.content.voiceNote.url.includes(oldUrl)) {
          post.content.voiceNote.url = post.content.voiceNote.url.replace(oldUrl, NEW_URL);
          updated = true;
        }
        
        if (updated) {
          await post.save();
          console.log(`Updated post ${post._id}`);
        }
      }
    }
    
    console.log('Production URL fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixProductionUrls();
```

## Step 4: Update Frontend Configuration

### Update Frontend Environment
Update `frontend/.env`:
```env
EXPO_PUBLIC_API_BASE=https://echo-yddc.onrender.com
EXPO_PUBLIC_SERVER_IP=echo-yddc.onrender.com
EXPO_PUBLIC_SERVER_PORT=443
```

### Update Media Utils for Production
The `getFullMediaUrl` function should automatically handle production URLs, but verify it's working correctly.

## Step 5: Test Deployment

### Test Voice Notes
1. Open your app
2. Navigate to home screen
3. Look for posts with voice notes
4. Try playing voice notes
5. Check browser console for any errors

### Test Media Loading
1. Check if images load properly
2. Test video playback
3. Verify all media URLs point to https://echo-yddc.onrender.com

## Step 6: Monitor Deployment

### Check Render Logs
```bash
# View deployment logs in Render dashboard
# Look for any errors during startup
```

### Verify Environment Variables
Ensure these are set in Render dashboard:
- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://...` (your Atlas connection)
- `JWT_SECRET=Acer.112`
- `JWT_EXPIRES_IN=7d`
- `MAX_FILE_SIZE=10485760`

## Troubleshooting

### If Voice Notes Still Don't Work
1. Check Render logs for errors
2. Verify database URLs were updated
3. Test API endpoints directly
4. Check CORS settings

### If Media URLs Are Wrong
1. Run the production URL fix script
2. Clear app cache
3. Restart the app

### If Deployment Fails
1. Check build logs in Render
2. Verify package.json scripts
3. Check for missing dependencies

## Expected Results After Deployment

✅ Voice notes play on all screens
✅ Images load from https://echo-yddc.onrender.com
✅ Videos stream properly
✅ All media URLs use HTTPS
✅ No CORS errors
✅ Faster loading times

## Quick Commands Summary

```bash
# 1. Commit and push
git add .
git commit -m "Fix voice note playback and media URLs"
git push origin main

# 2. Wait for Render auto-deploy (5-10 minutes)

# 3. Update frontend config
# Edit frontend/.env with production URL

# 4. Test the app
# Check voice notes and media loading
```

## Status: Ready to Deploy
All code changes are ready. Follow the steps above to deploy to Render.