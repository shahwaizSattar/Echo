# Location Name Not Showing - Debug Guide

## Issue
Custom location names and ratings are not appearing on posts in the City Radar feed.

## What We've Implemented

### ✅ Frontend (LocationPostModal.tsx)
- Location name is captured from user input
- Sent in `postData.locationName`

### ✅ Frontend (CityRadarScreen.tsx)
- Location name is added to payload: `locationName: postData.locationName || undefined`
- Display code exists: `{post.locationName && <Text>📌 {post.locationName}</Text>}`

### ✅ Backend (routes/posts.js)
- Extracts `locationName` and `rating` from request body
- Saves to database if provided

### ✅ Backend (models/Post.js)
- Has `locationName` field (String, default: null)
- Has `rating` field (Number, min: 1, max: 5, default: null)

### ✅ Backend (routes/location.js)
- Returns all post fields using `.toObject()`

## Debug Steps

### Step 1: Check Console Logs

When you create a post, check the console for:

**Frontend logs:**
```
📤 Sending post payload: { ... locationName: "...", rating: ... }
```

**Backend logs:**
```
📌 Saving locationName: Your Location Name
⭐ Saving rating: 4
💾 Saving post with data: { locationEnabled: true, locationName: "...", rating: 4 }
✅ Post saved with ID: ...
✅ Saved post locationName: Your Location Name
✅ Saved post rating: 4
```

**When fetching posts:**
```
📍 Post locationName: Your Location Name
📍 Post rating: 4
📤 Returning X posts
📤 First post has locationName: Your Location Name
📤 First post has rating: 4
```

**Frontend receiving:**
```
📍 Loaded posts: X
📍 First post locationName: Your Location Name
📍 First post rating: 4
```

### Step 2: Run Database Test

Run the test script to check what's in the database:

```bash
cd backend
node test-location-post.js
```

This will show you:
- How many location posts exist
- Whether locationName is saved
- Whether rating is saved
- The actual data in the database

### Step 3: Check Network Request

In your app's network inspector:

1. **When creating post** - Check the request body:
```json
{
  "content": { "text": "..." },
  "locationEnabled": true,
  "locationName": "Your Location Name",
  "rating": 4,
  "geoLocation": { ... }
}
```

2. **When fetching posts** - Check the response:
```json
{
  "success": true,
  "data": [{
    "_id": "...",
    "content": { "text": "..." },
    "locationName": "Your Location Name",
    "rating": 4,
    ...
  }]
}
```

### Step 4: Verify Data Flow

1. **Create a test post:**
   - Open City Radar
   - Tap "Post Here"
   - Select "Custom Location"
   - Enter "Test Location 123"
   - Select "Review" type
   - Select 4 stars
   - Enter some text
   - Submit

2. **Check logs immediately:**
   - Frontend should log the payload being sent
   - Backend should log receiving and saving the data

3. **Refresh the feed:**
   - Pull to refresh or navigate away and back
   - Check if "📌 Test Location 123" appears
   - Check if "⭐⭐⭐⭐☆ (4/5)" appears

## Common Issues

### Issue 1: locationName is undefined
**Symptom:** Backend logs show `locationName: undefined`

**Cause:** Frontend not sending it properly

**Fix:** Check that `postData.locationName` has a value in LocationPostModal

### Issue 2: locationName not saved to database
**Symptom:** Backend logs show saving but database test shows null

**Cause:** Post model might not have the field

**Fix:** Verify Post.js has:
```javascript
locationName: {
  type: String,
  default: null
}
```

### Issue 3: locationName not returned from API
**Symptom:** Database has it but API doesn't return it

**Cause:** Field not being selected or serialized

**Fix:** Already using `.toObject()` which should include all fields

### Issue 4: Frontend not displaying
**Symptom:** Data is in response but not showing on screen

**Cause:** Conditional rendering issue

**Fix:** Check the condition:
```typescript
{post.locationName && (
  <Text style={styles.postLocationName}>📌 {post.locationName}</Text>
)}
```

## Quick Test Checklist

- [ ] Create post with custom location name
- [ ] Check frontend console for payload
- [ ] Check backend console for save confirmation
- [ ] Run `node test-location-post.js` to verify database
- [ ] Refresh feed and check if location name appears
- [ ] Create post with rating
- [ ] Check if stars appear on post

## Expected Behavior

When everything works:

1. **Creating Post:**
   - Select custom location → Enter name → See "📌 [Name]" in modal
   - Select review → Choose stars → See stars highlighted
   - Submit → See success toast

2. **Viewing Post:**
   - Post appears in feed
   - Shows "📌 [Custom Location Name]" below content
   - Shows "⭐⭐⭐⭐☆ (4/5)" for reviews
   - Distance badge shows "📍 X.X km"

## Next Steps

1. Run the test script to see what's in the database
2. Create a new test post and watch the console logs
3. Check if the issue is:
   - Data not being sent (frontend issue)
   - Data not being saved (backend issue)
   - Data not being returned (API issue)
   - Data not being displayed (UI issue)

The console logs will tell you exactly where the data is getting lost.
