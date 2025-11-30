# Whisper Edit/Delete Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to edit whisper" or "Failed to delete whisper"

#### Check 1: Authentication Token
The app must be sending the authentication token with the request.

**Verify in browser console:**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to edit/delete a whisper
4. Find the PUT or DELETE request to `/api/whisperwall/[id]`
5. Check Request Headers for `Authorization: Bearer [token]`

**If token is missing:**
- User might not be logged in
- Token might have expired
- Check `frontend/src/services/api.ts` - ensure token is being sent

#### Check 2: User Authorization
Only the whisper author can edit/delete their whispers.

**Check backend logs:**
```bash
cd backend
# Look for these log messages:
📝 Edit whisper request: [whisper-id]
📝 User: [user-id]
📝 Whisper found, userId: [whisper-user-id]
```

**If authorization fails:**
- Verify `whisper.userId` matches `req.user._id`
- Check if whisper has a `userId` field (old whispers might not)
- Run migration script if needed

#### Check 3: Category Validation
The category must be one of the 6 valid categories.

**Valid categories:**
- Random
- Vent
- Confession
- Advice
- Gaming
- Love

**If validation fails:**
- Check backend logs for validation errors
- Ensure EditWhisperModal is sending correct category name
- Category names are case-sensitive

### Issue: Menu button not appearing

#### Check 1: Whisper Rendering
The menu button is only shown on the Profile screen's Whispers tab.

**Verify:**
1. Navigate to Profile (bottom tab)
2. Switch to "Whispers" tab (💭 icon)
3. Menu button should appear on top-right of each sticky note

#### Check 2: Z-Index
The menu button has `zIndex: 10` to appear above the sticky note.

**If button is hidden:**
- Check if WhisperBubble has higher z-index
- Verify button positioning in ProfileScreen.tsx

### Issue: Edit modal not showing categories correctly

#### Check 1: Category Data Structure
Categories should have `name` and `emoji` properties.

**Verify in EditWhisperModal.tsx:**
```typescript
const CATEGORIES = [
  { name: 'Random', emoji: '🎲' },
  { name: 'Vent', emoji: '😤' },
  // ... etc
];
```

#### Check 2: Category Selection
The selected category should match `whisper.category`.

**Debug:**
- Add console.log in EditWhisperModal to check initial category
- Verify category prop is being passed correctly

### Issue: Whisper not updating in UI after edit

#### Check 1: API Response
The edit endpoint should return the updated whisper.

**Check backend response:**
```json
{
  "success": true,
  "message": "Whisper updated successfully",
  "whisper": { ... }
}
```

#### Check 2: State Update
ProfileScreen should reload whispers after successful edit.

**Verify in ProfileScreen.tsx:**
```typescript
onSuccess={() => {
  loadWhisperPosts(); // This should be called
}}
```

### Issue: 401 Unauthorized error

**Cause:** No authentication token provided or token is invalid.

**Solutions:**
1. Ensure user is logged in
2. Check if token is expired (tokens expire after 7 days by default)
3. Try logging out and logging back in
4. Clear app cache/storage

**Check token in AsyncStorage:**
```javascript
// In React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
const token = await AsyncStorage.getItem('token');
console.log('Token:', token);
```

### Issue: 403 Forbidden error

**Cause:** User is not the author of the whisper.

**Solutions:**
1. Verify you're trying to edit your own whisper
2. Check if whisper has a `userId` field
3. Run migration script for old whispers without `userId`

**Migration script:**
```bash
cd backend
node migrate-whisper-userid.js
```

### Issue: Whisper not found (404)

**Cause:** Whisper ID is invalid or whisper was already deleted.

**Solutions:**
1. Verify whisper exists in database
2. Check if whisper was deleted by another process
3. Refresh the whispers list

**Check in MongoDB:**
```javascript
db.whisperposts.findOne({ _id: ObjectId("whisper-id-here") })
```

## Debug Mode

### Enable Detailed Logging

**Backend (already enabled):**
The edit/delete endpoints now log detailed information:
- Request parameters
- User authentication
- Authorization checks
- Validation errors

**Frontend:**
Add console logs in ProfileScreen.tsx:
```typescript
const handleEditWhisper = (whisper: any) => {
  console.log('Editing whisper:', whisper._id);
  console.log('Whisper data:', whisper);
  setWhisperToEdit(whisper);
  setEditWhisperModalVisible(true);
};
```

### Test with curl

**Edit whisper:**
```bash
curl -X PUT http://localhost:5000/api/whisperwall/[whisper-id] \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json" \
  -d '{"content":{"text":"Updated text"},"category":"Advice"}'
```

**Delete whisper:**
```bash
curl -X DELETE http://localhost:5000/api/whisperwall/[whisper-id] \
  -H "Authorization: Bearer [your-token]"
```

## Still Having Issues?

1. **Check backend logs** - Look for error messages and stack traces
2. **Check frontend console** - Look for network errors or API failures
3. **Run test script** - Use `node test-whisper-edit-delete.js` to verify backend
4. **Check database** - Verify whisper exists and has correct userId
5. **Restart servers** - Sometimes a fresh start helps

## Contact Support

If issues persist, provide:
- Backend logs (with timestamps)
- Frontend console errors
- Network request/response details
- Whisper ID and user ID
- Steps to reproduce the issue
