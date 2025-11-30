# WhisperWall Timed & One-Time Posts Feature

## ✅ Changes Completed

### Backend Changes

**1. Updated WhisperPost Model** (`backend/models/WhisperPost.js`)
- Added `vanishMode` field with duration options (1hour, 6hours, 12hours, 24hours, 1day, 1week)
- Added `oneTime` field with `viewedBy` array (stores session IDs for anonymity)
- Added pre-save hook to calculate vanish time
- Added index for `vanishMode.vanishAt` for efficient cleanup

**2. Updated WhisperWall Routes** (`backend/routes/whisperwall.js`)
- Modified POST `/api/whisperwall` to accept `vanishMode` and `oneTime` parameters
- Added POST `/api/whisperwall/:postId/mark-viewed` endpoint for one-time posts
- Updated GET `/api/whisperwall` to filter out already-viewed one-time posts per session

**3. API Service** (`frontend/src/services/api.ts`)
- Updated `createWhisper` type to include `vanishMode` and `oneTime`
- Added `markWhisperViewed` method

### Frontend Changes

**1. Removed from CreatePostScreen** (`frontend/src/screens/main/CreatePostScreen.tsx`)
- Removed "Timed Post (Self-Destruct)" section
- Removed "One-Time Post" section
- Removed `vanishMode`, `vanishDuration`, `customVanishMinutes` state
- Removed `oneTimePost` state
- Removed these fields from post creation payload

**2. Added to WhisperWallScreen** (`frontend/src/screens/main/WhisperWallScreen.tsx`)
- Added `vanishMode`, `vanishDuration`, `oneTimePost` state
- Added UI for "Timed Post (Self-Destruct)" with duration selector
- Added UI for "One-Time View" toggle
- Updated `handleCreateWhisper` to include these fields in payload
- Added styles for new UI components

## 🎯 How It Works

### Timed Posts (Vanish Mode)
1. User creates a whisper and enables "Timed Post"
2. Selects duration: 1hour, 6hours, 12hours, 24hours, 1day, or 1week
3. Backend calculates `vanishAt` timestamp
4. Post auto-deletes when time expires (handled by MongoDB TTL or cron job)

### One-Time Posts
1. User creates a whisper and enables "One-Time View"
2. When another user views the whisper, their session ID is recorded
3. That whisper no longer appears in their feed
4. Uses session IDs instead of user IDs to maintain anonymity

## 📊 Data Separation

**Regular Posts** (Home Feed)
- Stored in `Post` collection
- Queried via `/api/posts/feed`
- Can have user attribution

**WhisperWall Posts**
- Stored in `WhisperPost` collection
- Queried via `/api/whisperwall`
- Always anonymous with random usernames
- Now support timed and one-time features

## 🔒 Privacy Features

1. **Session-Based Tracking**: One-time posts use session IDs, not user IDs
2. **Separate Collections**: WhisperWall posts never mix with regular posts
3. **Anonymous Reactions**: Reactions stored without user attribution
4. **Auto-Cleanup**: All whispers auto-delete after 24 hours (plus vanish mode)

## 🧪 Testing

### Test Timed Posts
1. Go to WhisperWall
2. Create a new whisper
3. Enable "Timed Post (Self-Destruct)"
4. Select a duration (e.g., "1hour")
5. Post the whisper
6. Verify it appears in feed
7. Wait for duration to expire
8. Verify it's deleted

### Test One-Time Posts
1. Go to WhisperWall
2. Create a new whisper
3. Enable "One-Time View"
4. Post the whisper
5. View the whisper (opens detail modal)
6. Close and refresh feed
7. Verify whisper no longer appears for you
8. Check from another device/session - should still be visible

## 📝 API Endpoints

### Create Whisper with Features
```typescript
POST /api/whisperwall
{
  content: { text: string, media?: [] },
  category: string,
  backgroundAnimation?: string,
  vanishMode?: {
    enabled: boolean,
    duration?: '1hour' | '6hours' | '12hours' | '24hours' | '1day' | '1week'
  },
  oneTime?: {
    enabled: boolean
  }
}
```

### Mark One-Time Whisper as Viewed
```typescript
POST /api/whisperwall/:postId/mark-viewed
// No body required - uses session ID from cookie
```

## 🎨 UI Components

### Timed Post Section
- Toggle switch to enable/disable
- Duration selector with 6 options
- Visual feedback for selected duration
- Description: "Auto-delete after set time"

### One-Time Post Section
- Toggle switch to enable/disable
- Description: "Disappears after being viewed once"
- Simple on/off toggle

## 🔄 Migration Notes

- No database migration needed
- Existing WhisperPosts continue to work
- New fields are optional with defaults
- Backward compatible

## ✨ Benefits

1. **Better Privacy**: Timed posts auto-delete, reducing digital footprint
2. **Exclusive Content**: One-time posts create FOMO and exclusivity
3. **Cleaner Feeds**: Auto-cleanup keeps WhisperWall fresh
4. **Anonymous Tracking**: Session-based viewing maintains anonymity
5. **Feature Separation**: Regular posts stay simple, advanced features in WhisperWall

## 🚀 Future Enhancements

- Custom duration input for vanish mode
- View count for one-time posts (before they vanish)
- Notification when someone views your one-time post
- "Burn after reading" mode (combines both features)
- Analytics for whisper lifespan
