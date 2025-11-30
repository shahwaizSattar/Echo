# Quick Fix Summary: Unblocked User Posts Not Appearing

## What Was Wrong
After unblocking a user, their posts didn't show up in your home feed until you manually pulled to refresh.

## What We Fixed
1. **HomeScreen now auto-refreshes** when you navigate back to it (using `useFocusEffect`)
2. **Better user feedback** - Toast message now mentions pulling to refresh as a backup
3. **Debug logging** added to track feed loading

## How to Test
1. Block a user → their posts disappear ✓
2. Unblock the user → navigate back to home
3. **Posts should appear automatically** ✓
4. If not, pull-to-refresh will definitely work ✓

## Files Changed
- `frontend/src/screens/main/HomeScreen.tsx` - Added auto-refresh on focus
- `frontend/src/screens/main/BlockedUsersScreen.tsx` - Updated toast message

## Backend
No changes needed - backend was already working correctly!

The feed endpoint properly filters blocked users bidirectionally:
- You don't see posts from users you blocked
- You don't see posts from users who blocked you
- When you unblock someone, their posts are included in the next feed request
