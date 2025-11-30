# Unblock User Feed Refresh Fix

## Problem
When a user unblocks another user, their posts don't immediately appear in the home feed. The user has to manually pull-to-refresh to see the unblocked user's posts.

## Root Cause
The issue was that the `HomeScreen` wasn't automatically refreshing the feed when returning from the `BlockedUsersScreen` after unblocking a user. The backend correctly removes the user from the `blockedUsers` list, but the frontend feed wasn't being updated.

## Solution
We implemented two fixes:

### 1. Enhanced Feed Refresh on Focus
Updated the `HomeScreen` to automatically reload posts whenever the screen comes into focus using `useFocusEffect`. This ensures that when you navigate back from the BlockedUsersScreen, the feed automatically refreshes and includes posts from newly unblocked users.

**File:** `frontend/src/screens/main/HomeScreen.tsx`
```typescript
useFocusEffect(
  React.useCallback(() => {
    if (user) {
      // Reload posts when screen comes into focus
      // This ensures posts from unblocked users appear immediately
      loadPosts();
    }
  }, [user])
);
```

### 2. Updated Toast Message
Modified the success message in `BlockedUsersScreen` to inform users that they can pull-to-refresh if the automatic refresh doesn't happen immediately.

**File:** `frontend/src/screens/main/BlockedUsersScreen.tsx`
```typescript
Toast.show({
  type: 'success',
  text1: 'User Unblocked',
  text2: `@${username} unblocked. Pull to refresh your feed to see their posts.`,
  visibilityTime: 5000,
});
```

### 3. Added Debug Logging
Added console logs to track when the feed is loading and how many posts are retrieved, making it easier to debug similar issues in the future.

## How It Works

### Backend Flow (Already Working Correctly)
1. User navigates to Settings → Blocked Users
2. User taps "Unblock" on a blocked user
3. Frontend calls `DELETE /api/user/:userId/block`
4. Backend removes the userId from the current user's `blockedUsers` array
5. Backend returns success response

### Frontend Flow (Now Fixed)
1. `BlockedUsersScreen` receives success response
2. User is removed from the local blocked users list
3. Success toast is shown
4. User navigates back to HomeScreen
5. **NEW:** `useFocusEffect` triggers and calls `loadPosts()`
6. Feed API call is made: `GET /api/posts/feed`
7. Backend filters posts using the updated `blockedUsers` list (which no longer includes the unblocked user)
8. Posts from the unblocked user are now included in the response
9. Feed is updated with the new posts

### Backend Feed Filtering (Bidirectional Blocking)
The backend uses a helper function `getBidirectionalBlockedUsers()` that:
- Gets users that the current user has blocked
- Gets users who have blocked the current user
- Combines both lists to create a complete block list
- Filters out posts from all users in this combined list

This ensures that:
- If you block someone, you don't see their posts
- If someone blocks you, you don't see their posts
- When you unblock someone, their posts immediately become visible (after feed refresh)
- When someone unblocks you, your posts become visible to them

## Testing
To verify the fix works:

1. **Block a user:**
   - Go to a user's profile
   - Tap the three-dot menu
   - Select "Block User"
   - Verify their posts disappear from your feed

2. **Unblock the user:**
   - Go to Settings → Blocked Users
   - Find the blocked user
   - Tap "Unblock"
   - Navigate back to the home feed
   - **Expected:** The feed automatically refreshes and shows posts from the unblocked user
   - **Fallback:** If automatic refresh doesn't work, pull-to-refresh will load the posts

3. **Check console logs:**
   - Look for "🔄 Loading feed posts..." when the feed refreshes
   - Look for "✅ Feed loaded: X posts" to see how many posts were loaded

## Additional Notes

### Why useFocusEffect?
`useFocusEffect` is a React Navigation hook that runs whenever a screen comes into focus. This is perfect for our use case because:
- It runs when navigating back from BlockedUsersScreen
- It runs when switching tabs back to Home
- It ensures the feed is always fresh when the user views it

### Alternative Approaches Considered
1. **Event Emitter:** Could use an event emitter to notify HomeScreen when a user is unblocked
   - Pros: More explicit, immediate update
   - Cons: More complex, requires additional state management

2. **Global State:** Could use Context or Redux to manage blocked users globally
   - Pros: Single source of truth
   - Cons: Overkill for this use case, adds complexity

3. **Navigation Params:** Could pass a refresh flag via navigation params
   - Pros: Explicit control
   - Cons: Requires changes to navigation flow, less maintainable

The `useFocusEffect` approach is the simplest and most React Navigation-idiomatic solution.

## Related Files
- `frontend/src/screens/main/HomeScreen.tsx` - Main feed screen
- `frontend/src/screens/main/BlockedUsersScreen.tsx` - Blocked users management
- `backend/routes/user.js` - User blocking/unblocking endpoints
- `backend/routes/posts.js` - Feed endpoint with blocking filters
- `backend/models/User.js` - User model with blockedUsers field

## Future Improvements
1. Add optimistic updates to remove blocked user's posts immediately without waiting for API
2. Add a "Refresh" button in the success toast for manual refresh
3. Consider caching the feed and invalidating cache on block/unblock actions
4. Add analytics to track how often users block/unblock others
