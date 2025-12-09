# Comprehensive Database Seeding Guide

## Overview
This guide explains how to seed your database with dummy accounts, posts, reactions, and comments to test all features of the application.

## What Gets Created

### 👥 Users (5 accounts)
1. **sohari** - Main test account
   - Email: `sohari@example.com`
   - Password: `password123`
   - Preferences: Technology, Gaming, Music

2. **alex_tech** - Tech enthusiast
   - Email: `alex@example.com`
   - Password: `password123`
   - Preferences: Technology, Gaming

3. **sarah_music** - Music lover
   - Email: `sarah@example.com`
   - Password: `password123`
   - Preferences: Music, Art

4. **mike_fitness** - Fitness coach
   - Email: `mike@example.com`
   - Password: `password123`
   - Preferences: Fitness, Food

5. **emma_travel** - Travel blogger
   - Email: `emma@example.com`
   - Password: `password123`
   - Preferences: Travel, Photography

### 📝 Post Types Created

#### 1. Regular Posts with Images (5 posts)
- Various categories based on user preferences
- Sample images from Picsum
- Text content relevant to category

#### 2. Video Posts (2 posts)
- Sample videos from public sources
- Different categories

#### 3. Voice Note Posts (3 posts)
- Different voice effects: none, deep, soft, robot, girly
- Duration: 30-50 seconds
- Sample audio file

#### 4. One-Time View Posts (3 posts)
- Disappear after viewing
- Include images
- Various categories

#### 5. Timed/Vanishing Posts (4 posts)
- Different durations: 1 hour, 6 hours, 12 hours, 24 hours
- Auto-delete after time expires
- Include images

#### 6. Poll Posts (3 polls)
- "What's your favorite time to post?" (4 options)
- "Best social media feature?" (4 options)
- "Coffee or Tea?" (2 options)

#### 7. Review Posts (3 posts)
- Ratings: 5 stars, 4 stars, 3 stars
- Food category
- Include images

#### 8. Location/City Radar Posts (10 posts)
**Based on YOUR location with realistic distances:**
- 🏠 Ultra-local (0-500m): 3 posts
  - Coffee Shop - 200m away
  - Local Park - 400m away
  - Nearby Restaurant - 500m away
- 🚶 Nearby (500m-5km): 3 posts
  - Shopping Mall - 1.5km away
  - University - 2.8km away
  - Sports Complex - 4.2km away
- 🏙️ City-wide (5km-20km): 3 posts
  - City Center - 8.5km away
  - Beach Area - 12.3km away
  - Airport - 18.7km away
- 📌 Your exact location: 1 post

**Customize**: Edit YOUR_LOCATION in the script to use your actual coordinates!
See `CITY_RADAR_SEEDING_GUIDE.md` for details.

#### 9. Sohari Account Posts (5 posts)
- Image upload test
- Video upload test
- Voice note test
- Poll feature test
- One-time post test

### ❤️ Reactions & Comments

Each post receives:
- **5-20 random reactions** from different users
- Reaction types: funny 😂, rage 😡, shock 😱, relatable 💯, love ❤️, thinking 🤔
- **1-5 random comments** from different users
- Comment texts vary (praise, questions, reactions)

### 🤫 WhisperWall Posts (5 posts)
- Anonymous posts with random usernames
- Categories: Confession, Vent, Advice, Random, Love
- Background animations: rain, neon, fire, snow, hearts
- Auto-expire after 24 hours

## How to Run

### Method 1: Using Batch File (Windows)
```bash
cd backend
run-seed.bat
```

### Method 2: Direct Node Command
```bash
cd backend
node seed-comprehensive-data.js
```

### Method 3: From Project Root
```bash
node backend/seed-comprehensive-data.js
```

## Important Notes

⚠️ **Warning**: This script will:
- Delete ALL existing users
- Delete ALL existing posts
- Delete ALL existing whisper posts
- Create fresh data

💡 **Tip**: Run this script when you want to:
- Test the app with realistic data
- Demo features to stakeholders
- Reset your development database
- Test reactions and comments functionality

## New Feature: Top 3 Reactions Display

### What It Does
Instead of just showing a number of likes, the app now displays:
- The top 3 most-used reaction emojis
- Total reaction count
- Appears beside the like count on posts

### Where It Appears
- ✅ Home feed
- ✅ Post detail screen
- ✅ Profile screens
- ✅ City Radar posts
- ✅ WhisperWall posts

### Example Display
```
😂❤️💯 45 • 12 comments
```
This shows:
- Top 3 reactions: funny, love, relatable
- 45 total reactions
- 12 comments

### How It Works
1. Counts all reactions on a post
2. Sorts by most popular
3. Shows top 3 emoji icons
4. Displays total count
5. Clickable to view post details

## Testing the Features

### 1. Test Regular Posts
- Login as any user
- Browse home feed
- See posts with images, videos, voice notes

### 2. Test Reactions
- Click on any post's like button
- See reaction popup
- Choose a reaction
- See top 3 reactions update

### 3. Test Comments
- Click comment button
- Add a comment
- See comment count update

### 4. Test One-Time Posts
- Find posts marked as "one-time"
- Click to reveal
- Post disappears after viewing

### 5. Test Polls
- Find poll posts
- Vote on options
- See results update

### 6. Test City Radar
- Go to City Radar screen
- See posts from different locations
- Filter by distance

### 7. Test WhisperWall
- Go to WhisperWall screen
- See anonymous posts
- React and comment anonymously

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Make sure MongoDB is running
```bash
# Start MongoDB
mongod
```

### Module Not Found Error
```
Error: Cannot find module './models/User'
```
**Solution**: Make sure you're in the backend directory
```bash
cd backend
node seed-comprehensive-data.js
```

### Authentication Error
```
Error: Authentication failed
```
**Solution**: Check your MongoDB connection string in `.env`
```
MONGODB_URI=mongodb://localhost:27017/whisperwall
```

## Next Steps

After seeding:
1. Start the backend server
2. Start the frontend app
3. Login with sohari account
4. Explore all features
5. Test reactions and comments
6. Check top 3 reactions display

## API Endpoints Used

The seeding script uses these models:
- `User` - Create user accounts
- `Post` - Create regular posts
- `WhisperPost` - Create anonymous posts

Methods used:
- `post.addReaction(userId, reactionType)` - Add reactions
- `post.save()` - Save posts with comments
- `user.save()` - Update user stats

## Sample Data Sources

- **Images**: Picsum Photos (https://picsum.photos)
- **Videos**: Google Test Videos
- **Audio**: SoundHelix Sample Music

All media URLs are publicly accessible and free to use for testing.

## Customization

To customize the seeding:

1. **Add more users**: Edit `dummyUsers` array
2. **Change post content**: Edit `postContents` object
3. **Add more polls**: Edit `pollQuestions` array
4. **Change locations**: Edit `locationPosts` array
5. **Adjust reaction counts**: Modify `numReactions` range
6. **Adjust comment counts**: Modify `numComments` range

## Summary

✅ Creates 5 users with different preferences
✅ Creates 40+ posts of various types
✅ Adds realistic reactions (5-20 per post)
✅ Adds comments (1-5 per post)
✅ Creates WhisperWall posts
✅ Updates user statistics
✅ Implements top 3 reactions display
✅ Ready for testing and demo

---

**Login Credentials**
- Email: `sohari@example.com`
- Password: `password123`

Happy testing! 🚀
