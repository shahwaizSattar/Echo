# Debug Guide: Whisper Profile Not Showing

## Current Status
- ✅ Backend has 1 whisper for user `uiuuii` (ID: `6925c9085cac41571559e1fa`)
- ✅ Backend endpoint `/api/whisperwall/user/:userId` exists
- ❓ Frontend shows "No whispers yet"

## Debug Steps

### Step 1: Check Browser Console
1. Open your app in the browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Navigate to Profile → Click Whispers tab
5. Look for these debug messages:

**Expected logs:**
```
🔍 loadWhisperPosts called
🔍 User object: {_id: "6925c9085cac41571559e1fa", username: "uiuuii", ...}
🔍 User._id: 6925c9085cac41571559e1fa
🔄 Loading whispers for user: 6925c9085cac41571559e1fa
🔄 API call: /api/whisperwall/user/6925c9085cac41571559e1fa
📥 Whisper response: {...}
✅ Loaded whispers count: 1
✅ Whispers data: [...]
🔍 whisperPosts state changed: 1 whispers
🎨 Rendering whisper tab
🎨 whisperPosts.length: 1
🎨 Rendering whisper 0: 692c32fce88b105b732167e3
```

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Click Whispers tab in Profile
3. Look for request to `/api/whisperwall/user/6925c9085cac41571559e1fa`
4. Click on the request
5. Check:
   - **Status**: Should be `200 OK`
   - **Response**: Should contain `{"success": true, "whispers": [...]}`

### Step 3: Common Issues & Solutions

#### Issue 1: "❌ No user ID available"
**Problem:** User object doesn't have `_id` field

**Solution:**
```javascript
// Check what fields the user object has
console.log('User keys:', Object.keys(user));
```

If `_id` is missing, check:
- AuthContext is providing the full user object
- User is properly logged in
- Token is valid

#### Issue 2: Network Error
**Problem:** API call fails with network error

**Solution:**
- Check backend is running: `http://localhost:5000/health`
- Check IP address in `frontend/.env` matches backend
- Check firewall isn't blocking the connection

#### Issue 3: 404 Not Found
**Problem:** Endpoint doesn't exist

**Solution:**
- Verify backend route is registered in `server.js`:
  ```javascript
  app.use('/api/whisperwall', whisperWallRoutes);
  ```
- Restart backend server

#### Issue 4: Empty Response
**Problem:** API returns `{"success": true, "whispers": []}`

**Solution:**
- Whispers in database don't have `userId` field
- Run migration script:
  ```bash
  cd backend
  node migrate-whisper-userid.js
  ```

### Step 4: Manual API Test

Test the API directly using curl or browser:

```bash
# Replace with your actual user ID
curl http://localhost:5000/api/whisperwall/user/6925c9085cac41571559e1fa
```

Expected response:
```json
{
  "success": true,
  "whispers": [
    {
      "_id": "692c32fce88b105b732167e3",
      "userId": "6925c9085cac41571559e1fa",
      "content": {
        "text": "This is a test whisper for profile display"
      },
      "category": "Random",
      "oneTime": {
        "enabled": false
      },
      "vanishMode": {
        "enabled": false
      },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "hasMore": false
  }
}
```

### Step 5: Check Whisper Data

Run the test script to verify database:
```bash
cd backend
node test-whisper-profile.js
```

This shows:
- Total whispers in database
- Whispers by your user
- Which whispers should appear on profile

## Quick Fix: Create New Whisper

If existing whispers don't have `userId`, create a new one:

1. Go to WhisperWall screen
2. Create a new whisper (NOT one-time)
3. Go back to Profile → Whispers tab
4. New whisper should appear

## Report Back

After following these steps, report:
1. What console logs you see
2. What network response you get
3. Any error messages
4. Screenshots if possible

This will help identify the exact issue!
