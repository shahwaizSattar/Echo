# Search Functionality - Complete Database Search

## Overview
The search functionality has been updated to search the **entire database** for users and posts, not just content from your feed. Blocked users are properly excluded and will reappear in search results after being unblocked.

## Features

### 1. **Global User Search**
- Searches **all users** in the database
- Matches against username and bio
- Excludes:
  - Yourself
  - Users you've blocked
  - Users who have blocked you (bidirectional)
- Results sorted by karma score
- Limit: 50 users per search

### 2. **Global Post Search**
- Searches **all posts** in the database
- Matches against:
  - Post text content
  - Category names
  - Tags/hashtags
- Excludes posts from:
  - Users you've blocked
  - Users who have blocked you (bidirectional)
  - Users you've muted
- Filters out:
  - Hidden posts
  - Vanished posts (expired)
- Results sorted by most recent
- Limit: 20 posts per search

### 3. **Bidirectional Blocking**
- When you block a user:
  - They disappear from your search results
  - Their posts disappear from your search results
  - They cannot see you in search results
  - They cannot see your posts in search results
  
- When you unblock a user:
  - They immediately reappear in search results
  - Their posts immediately reappear in search results
  - Normal visibility is restored

## Technical Implementation

### Backend Routes

#### User Search: `GET /api/user/search`
```javascript
// Searches entire database
// Excludes blocked users bidirectionally
// Query parameters:
// - q: search query (required, min 1 character)
// - category: filter by preference category (optional)
```

#### Post Search: `GET /api/posts/search`
```javascript
// Searches entire database
// Excludes blocked/muted users bidirectionally
// Query parameters:
// - q: search query (required, min 1 character)
// - category: filter by post category (optional)
// - page: pagination page number (default: 1)
// - limit: results per page (default: 20)
```

### Frontend Implementation

#### SearchScreen Component
- Real-time search as you type
- Combines user and post results
- Shows search history
- Clear visual indicators for result types:
  - 👤 Users
  - 📝 Posts
  - 🏷️ Hashtags

## Usage

### Search for Users
1. Open the Search screen
2. Type a username or bio keyword
3. Results show all matching users (except blocked)
4. Tap a user to view their profile

### Search for Posts
1. Open the Search screen
2. Type post content, category, or hashtag
3. Results show all matching posts (except from blocked users)
4. Tap a post to view details

### Search Tips
- Use `@` prefix to search specifically for users
- Use `#` prefix to search for hashtags
- Search is case-insensitive
- Minimum 1 character required
- Results update in real-time

## Testing

### Test Blocking/Unblocking
1. Search for a user (e.g., "testuser")
2. Block that user
3. Search again - user should not appear
4. Unblock the user
5. Search again - user should reappear immediately

### Test Post Search
1. Search for a keyword (e.g., "gaming")
2. Note the posts that appear
3. Block one of the post authors
4. Search again - that author's posts should not appear
5. Unblock the author
6. Search again - posts should reappear

## Debugging

### Console Logs
The search functionality includes detailed console logs:
- `🔍 Searching entire user database with query: [query]`
- `🔍 Found users: [count]`
- `🔍 Searching entire post database with query: [query]`
- `🔍 Found posts: [count]`
- `🔍 User search: query="[query]", blocked count=[count]`
- `🔍 Post search: query="[query]", blocked count=[count], muted count=[count]`

### Common Issues

**Issue**: No results found
- **Solution**: Check if the search query is too specific
- **Solution**: Verify the backend server is running
- **Solution**: Check console logs for errors

**Issue**: Blocked user still appears
- **Solution**: Refresh the app
- **Solution**: Check if the block was successful (check BlockedUsersScreen)
- **Solution**: Verify bidirectional blocking is working (check backend logs)

**Issue**: Unblocked user doesn't reappear
- **Solution**: The user should appear immediately after unblocking
- **Solution**: Try searching again
- **Solution**: Check backend logs for blocking/unblocking operations

## Files Modified

### Backend
- `backend/routes/user.js` - User search endpoint
- `backend/routes/posts.js` - Post search endpoint

### Frontend
- `frontend/src/screens/main/SearchScreen.tsx` - Search UI and logic
- `frontend/src/services/api.ts` - API service methods

## API Response Format

### User Search Response
```json
{
  "success": true,
  "users": [
    {
      "_id": "user_id",
      "username": "username",
      "avatar": "avatar_url",
      "bio": "user bio",
      "preferences": ["Gaming", "Music"],
      "stats": {
        "karmaScore": 100,
        "followers": 50
      }
    }
  ],
  "count": 1
}
```

### Post Search Response
```json
{
  "success": true,
  "posts": [
    {
      "_id": "post_id",
      "content": {
        "text": "post content"
      },
      "category": "Gaming",
      "author": {
        "_id": "author_id",
        "username": "author_username",
        "avatar": "avatar_url"
      },
      "createdAt": "2025-11-29T00:00:00.000Z"
    }
  ],
  "data": [...], // Same as posts
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": false
  }
}
```

## Summary

✅ Search now covers the **entire database**
✅ Blocked users are properly excluded (bidirectional)
✅ Unblocked users reappear immediately
✅ Muted users are excluded from post search
✅ Better logging for debugging
✅ Increased user search limit to 50 results
✅ Clear visual feedback in the UI
