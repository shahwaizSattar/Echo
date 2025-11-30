# Whisper Profile Tab Fix

## Issue
The whisper tab in the profile screen was showing "No whispers yet" even though the user had created whispers.

## Root Cause
The API interceptor was **skipping the auth token** for WhisperWall requests. This meant:
1. Whispers were created without a `userId` field
2. The backend couldn't link whispers to the user
3. Profile couldn't display the user's whispers

The comment in the code said "Skip auth token for WhisperWall requests (they use session IDs)" but this was incorrect - we need the auth token to link whispers to users while still displaying them anonymously.

## Changes Made

### Frontend (`frontend/src/services/api.ts`)
**CRITICAL FIX**: Removed the auth token skip for WhisperWall requests:

**Before:**
```typescript
// Skip auth token for WhisperWall requests (they use session IDs)
if (!config.url?.includes('/whisperwall')) {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
}
```

**After:**
```typescript
const token = await AsyncStorage.getItem('authToken');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

Now auth tokens are sent with ALL requests, allowing whispers to be linked to users.

### Backend (`backend/routes/whisperwall.js`)
Added expiration filter to exclude expired whispers:
```javascript
const matchCriteria = {
  userId: userObjectId,
  isHidden: false,
  'oneTime.enabled': false,
  $or: [
    { 'vanishMode.enabled': false },
    { 'vanishMode.enabled': true, expiresAt: { $gt: new Date() } }
  ]
};
```

## Testing
Test whispers for a specific user:
```bash
cd backend
node test-sohari-whispers.js  # Tests user "sohari" - returns 0 whispers
node test-user-whispers-api.js # Tests user "uiuuii" - returns 5 whispers
```

## How to Test the Feature
1. **Restart the app** to apply the API interceptor fix
2. Log in as a user
3. Go to WhisperWall and create a new whisper
4. Navigate to Profile > Whisper tab
5. Your new whisper should appear!

## Note About Existing Whispers
Whispers created BEFORE this fix will have `userId: undefined` and won't appear in profiles. Only NEW whispers created after the fix will be linked to users.

To fix existing whispers, you can run a migration script to set their userId based on creation patterns.

## Result
- ✅ Auth tokens now sent with whisper creation
- ✅ New whispers are linked to users via `userId`
- ✅ Whispers still display anonymously with `randomUsername`
- ✅ Profile whisper tab shows user's whispers
- ✅ One-time posts excluded from profile
- ✅ Expired whispers filtered out
