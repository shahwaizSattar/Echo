# WhisperWall 24-Hour Duration Limit Fix

## Changes Made

Fixed the WhisperWall post creation to only support up to 24-hour durations, as WhisperWall is designed for short-lived anonymous posts.

### Modified File
- `frontend/src/screens/main/WhisperWallScreen.tsx`

### Changes

1. **Removed long-duration options**
   - Removed '1day' and '1week' from duration selector
   - Now only shows: 1hour, 6hours, 12hours, 24hours, custom

2. **Updated default duration**
   - Changed from '1day' to '24hours'

3. **Limited custom slider**
   - Changed maximum from 10080 minutes (7 days) to 1440 minutes (24 hours)
   - Users can now only set custom durations up to 24 hours

4. **Updated TypeScript types**
   - Removed '1day' and '1week' from the vanishDuration type definition

## Result

When creating a whisper with timed post (self-destruct) enabled:
- Quick options: 1hour, 6hours, 12hours, 24hours, custom
- Custom slider: 1 minute to 1440 minutes (24 hours)
- Default selection: 24hours

This ensures all WhisperWall posts respect the 24-hour maximum lifetime.
