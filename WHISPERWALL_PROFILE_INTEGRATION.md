# WhisperWall Profile Integration

## Overview
WhisperWall posts are now saved on user profiles with proper filtering:
- ✅ **Regular whispers** are saved and displayed
- ✅ **Timed posts** remain until their expiration time
- ❌ **One-time posts** are excluded from profile display

## Changes Made

### Backend Changes

#### 1. WhisperPost Model (`backend/models/WhisperPost.js`)
- Added `userId` field to track post author while maintaining anonymity
- Field is optional for backward compatibility
- Not exposed in public WhisperWall API to preserve anonymity

```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false
}
```

#### 2. WhisperWall Routes (`backend/routes/whisperwall.js`)
- Updated POST `/api/whisperwall` to store authenticated user's ID
- Added GET `/api/whisperwall/user/:userId` endpoint to fetch user's whispers
- Automatically filters out one-time posts (`oneTime.enabled: false`)
- Includes timed posts until they expire naturally

### Frontend Changes

#### 3. API Service (`frontend/src/services/api.ts`)
- Added `getUserWhispers()` method to whisperWallAPI
- Fetches whisper posts for a specific user

```typescript
getUserWhispers: async (userId: string, page: number = 1, limit: number = 20)
```

#### 4. Profile Screen (`frontend/src/screens/main/ProfileScreen.tsx`)
- Added `whisperPosts` state to store user's whispers
- Added `loadWhisperPosts()` function to fetch whispers
- Updated tabs to display whispers in the "Whispers" tab
- Added visual badge for whisper posts showing:
  - 💭 Anonymous Whisper indicator
  - Vanish duration if enabled
- Whisper posts navigate to WhisperWall screen when tapped

## Features

### Post Types on Profile

1. **Home Posts Tab** 🏠
   - Regular posts without location
   - One-time posts (with view count)
   - Standard posts with reactions/comments

2. **Radar Posts Tab** 📍
   - Location-enabled posts
   - Shows city and emoji
   - Geo-tagged content

3. **Whispers Tab** 💭
   - Anonymous whisper posts
   - Excludes one-time whispers
   - Includes timed whispers until expiry
   - Shows vanish duration if applicable
   - Maintains anonymity (no username shown)

### Whisper Post Display

Whisper posts show:
- Category tag
- Anonymous badge with vanish info
- Content (text, media, voice notes)
- Reaction counts (anonymous)
- Comment counts
- Creation date
- Background animation indicator

### Privacy & Anonymity

- User ID is stored but never exposed in public API
- Random usernames are still generated for display
- Profile only shows user's own whispers
- Other users cannot see who posted which whisper
- Session-based reactions remain anonymous

## API Endpoints

### Get User's Whispers
```
GET /api/whisperwall/user/:userId
Query params: page, limit
```

**Response:**
```json
{
  "success": true,
  "whispers": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

**Filtering:**
- Excludes `oneTime.enabled: true` posts
- Includes timed posts until `vanishMode.vanishAt`
- Only shows non-hidden posts

## Testing

### Backend Test
Run the test script to verify database queries:
```bash
cd backend
node test-whisper-profile.js
```

This will:
- Show total whispers in database
- Show whispers by test user
- Show one-time posts count
- List all profile-visible whispers
- Create a test whisper if none exist

### Frontend Test

1. **Create Whisper Posts:**
   - Open WhisperWall screen
   - Create a regular whisper (no special modes)
   - Create a timed whisper (1 hour, 6 hours, etc.)
   - Create a one-time whisper

2. **Check Profile:**
   - Navigate to Profile → Whispers tab
   - Regular whispers should appear with WhisperBubble UI
   - Timed whispers should appear with duration badge
   - One-time whispers should NOT appear

3. **Verify UI:**
   - Whispers display as sticky notes (same as WhisperWall)
   - Category colors match WhisperWall
   - Tapping whisper navigates to WhisperWall
   - Empty state shows helpful message

4. **Verify Expiration:**
   - Timed posts remain until vanishAt time
   - After expiration, posts are removed by MongoDB TTL index

### Debugging

If whispers don't appear:
1. Check browser/app console for errors
2. Verify user._id is available in ProfileScreen
3. Check network tab for API call to `/api/whisperwall/user/:userId`
4. Run backend test script to verify database has whispers
5. Check that whispers have `userId` field set

## Database Indexes

Existing indexes support the new feature:
- `{ userId: 1, createdAt: -1 }` - Fast user whisper queries
- `{ 'vanishMode.vanishAt': 1 }` - TTL for timed posts
- `{ 'oneTime.enabled': 1 }` - Filter one-time posts

## Future Enhancements

- [ ] Add whisper analytics (views, engagement)
- [ ] Allow users to delete their whispers
- [ ] Add whisper archive feature
- [ ] Show whisper mood/theme statistics
- [ ] Add whisper export functionality

## Notes

- Backward compatible with existing whispers (userId is optional)
- Maintains full anonymity in public WhisperWall
- Profile whispers are only visible to the post owner
- Timed posts automatically expire via MongoDB TTL
- One-time posts are never shown on profile (privacy feature)
