# Search Functionality Test Guide

## Quick Test Steps

### 1. Test User Search (Entire Database)

**Step 1: Search for any user**
```
1. Open the app
2. Go to Search screen
3. Type any username (e.g., "test", "user", "admin")
4. You should see ALL users matching that query from the entire database
5. Check console logs: "🔍 Searching entire user database with query: [query]"
```

**Step 2: Test blocking**
```
1. Search for a specific user (e.g., "testuser")
2. Note that the user appears in results
3. Go to that user's profile
4. Block the user
5. Go back to Search
6. Search for the same user again
7. ✅ The user should NOT appear in results
8. Check console logs: "blocked count=[number]"
```

**Step 3: Test unblocking**
```
1. Go to Settings > Blocked Users
2. Unblock the user you just blocked
3. Go back to Search
4. Search for the same user again
5. ✅ The user should NOW appear in results immediately
```

### 2. Test Post Search (Entire Database)

**Step 1: Search for any post**
```
1. Open the app
2. Go to Search screen
3. Type any keyword (e.g., "gaming", "music", "hello")
4. You should see ALL posts matching that query from the entire database
5. Check console logs: "🔍 Searching entire post database with query: [query]"
```

**Step 2: Test blocking (posts disappear)**
```
1. Search for a keyword (e.g., "test")
2. Note the posts that appear and their authors
3. Go to one of the post author's profiles
4. Block that author
5. Go back to Search
6. Search for the same keyword again
7. ✅ Posts from that author should NOT appear
8. Check console logs: "blocked count=[number]"
```

**Step 3: Test unblocking (posts reappear)**
```
1. Go to Settings > Blocked Users
2. Unblock the user you just blocked
3. Go back to Search
4. Search for the same keyword again
5. ✅ Posts from that author should NOW appear immediately
```

### 3. Test Bidirectional Blocking

**Setup: You need 2 accounts for this test**

**Account A blocks Account B:**
```
1. Login as Account A
2. Block Account B
3. Search for Account B
4. ✅ Account B should NOT appear
5. Logout and login as Account B
6. Search for Account A
7. ✅ Account A should NOT appear (bidirectional)
```

**Account A unblocks Account B:**
```
1. Login as Account A
2. Unblock Account B
3. Search for Account B
4. ✅ Account B should appear
5. Logout and login as Account B
6. Search for Account A
7. ✅ Account A should appear (bidirectional restored)
```

## Expected Console Logs

### User Search
```
🔍 Searching entire user database with query: test
🔍 User search response: { success: true, users: [...], count: 5 }
🔍 Found users: 5
🔍 User search: query="test", blocked count=0
🔍 User search results: found 5 users
```

### Post Search
```
🔍 Searching entire post database with query: gaming
🔍 Post search response: { success: true, posts: [...], data: [...] }
🔍 Found posts: 10
🔍 Post search: query="gaming", blocked count=0, muted count=0
🔍 Post search results: found 10 posts
```

### After Blocking
```
🔍 User search: query="testuser", blocked count=1
🔍 User search results: found 0 users
```

### After Unblocking
```
🔍 User search: query="testuser", blocked count=0
🔍 User search results: found 1 users
```

## Verification Checklist

- [ ] User search returns results from entire database
- [ ] Post search returns results from entire database
- [ ] Blocked users don't appear in user search
- [ ] Posts from blocked users don't appear in post search
- [ ] Unblocked users immediately reappear in search
- [ ] Posts from unblocked users immediately reappear in search
- [ ] Bidirectional blocking works (both users can't see each other)
- [ ] Bidirectional unblocking works (both users can see each other)
- [ ] Search works with minimum 1 character
- [ ] Search is case-insensitive
- [ ] Console logs show correct blocked/muted counts

## Troubleshooting

### Issue: Search returns no results
**Check:**
1. Is the backend server running?
2. Are there any users/posts in the database?
3. Check console for error messages
4. Try a more generic search term (e.g., just "a" or "e")

### Issue: Blocked user still appears
**Check:**
1. Did the block operation succeed? (Check BlockedUsersScreen)
2. Check backend logs for block operation
3. Try refreshing the app
4. Check console logs for "blocked count"

### Issue: Unblocked user doesn't reappear
**Check:**
1. Did the unblock operation succeed?
2. The user should appear immediately - no refresh needed
3. Check backend logs for unblock operation
4. Check console logs for "blocked count" (should be 0 or decreased)

## Database Verification (Backend)

You can verify the search is working correctly by checking the backend logs:

```bash
# Start the backend with logging
cd backend
npm start

# You should see logs like:
🔍 User search: query="test", blocked count=0
🔍 User search results: found 5 users
🔍 Post search: query="gaming", blocked count=0, muted count=0
🔍 Post search results: found 10 posts
```

## API Testing (Optional)

You can also test the API directly using curl or Postman:

### Test User Search
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/user/search?q=test"
```

### Test Post Search
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/posts/search?q=gaming"
```

## Success Criteria

✅ **Search works globally** - Not limited to feed content
✅ **Blocking works** - Blocked users/posts disappear immediately
✅ **Unblocking works** - Unblocked users/posts reappear immediately
✅ **Bidirectional** - Both users affected by block/unblock
✅ **No errors** - Console shows successful operations
✅ **Performance** - Search returns results quickly (< 1 second)
