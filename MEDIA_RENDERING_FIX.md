# Media Rendering Fix - Legacy Image Support

## Problem
Older posts with media were not rendering on the homepage and other screens. This was because:
- Old posts stored images in `content.image` (single string field)
- New posts store media in `content.media` (array of media objects)
- The frontend only checked for `content.media`, ignoring legacy `content.image`

## Solution
Updated all screens that render media to support both formats:

### Files Modified
1. **frontend/src/screens/main/HomeScreen.tsx**
   - Updated `renderMedia()` to accept optional `legacyImage` parameter
   - Converts legacy image to media array format if needed

2. **frontend/src/screens/main/PostDetailScreen.tsx**
   - Same fix applied to post detail view

3. **frontend/src/screens/main/ProfileScreen.tsx**
   - Same fix applied to user's own profile posts

4. **frontend/src/screens/main/UserProfileScreen.tsx**
   - Same fix applied to other users' profile posts

### How It Works
```typescript
const renderMedia = (media: any[], legacyImage?: string) => {
  // If no media array but legacy image exists, convert it
  if (legacyImage && (!media || media.length === 0)) {
    media = [{
      url: legacyImage,
      type: 'image',
      filename: 'legacy-image',
      originalName: 'image',
      size: 0
    }];
  }
  
  // Continue with normal rendering...
}
```

### Usage
```typescript
// Pass both content.media and content.image
{renderMedia(post.content.media, post.content?.image)}
```

## Database Migration (Optional)
A migration script is provided to convert all old posts to the new format:

```bash
cd backend
node scripts/migrateMediaFormat.js
```

This will:
- Find all posts with `content.image` but no `content.media`
- Convert them to the new array format
- Keep the old field for backward compatibility (optional)

## Testing
1. Check that old posts with images now display correctly
2. Verify new posts with media still work
3. Test on all screens: Home, Profile, UserProfile, PostDetail

## Notes
- The fix is backward compatible - old and new formats both work
- No database changes required (but migration script available)
- All media types (image, video, audio) are supported
