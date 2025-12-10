const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupInvalidPosts() {
  try {
    console.log('🧹 Cleaning up invalid posts...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    const Post = mongoose.model('Post', require('./backend/models/Post').schema);
    const User = mongoose.model('User', require('./backend/models/User').schema);

    // Get all user IDs
    const users = await User.find({}).select('_id');
    const validUserIds = users.map(u => u._id);
    console.log(`Valid user IDs: ${validUserIds.length}`);

    // Find posts with invalid authors
    const invalidPosts = await Post.find({
      $or: [
        { author: null },
        { author: { $exists: false } },
        { author: { $nin: validUserIds } }
      ]
    });

    console.log(`Found ${invalidPosts.length} invalid posts`);

    if (invalidPosts.length > 0) {
      // Delete invalid posts
      const deleteResult = await Post.deleteMany({
        $or: [
          { author: null },
          { author: { $exists: false } },
          { author: { $nin: validUserIds } }
        ]
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} invalid posts`);
    }

    // Verify remaining posts
    const remainingPosts = await Post.find({}).populate('author', 'username avatar');
    console.log(`Remaining valid posts: ${remainingPosts.length}`);

    // Show final stats
    const authorStats = {};
    remainingPosts.forEach(post => {
      if (post.author) {
        const author = post.author.username;
        authorStats[author] = (authorStats[author] || 0) + 1;
      }
    });

    console.log('\n📊 Final Posts by Author:');
    Object.entries(authorStats).forEach(([author, count]) => {
      console.log(`${author}: ${count} posts`);
    });

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

cleanupInvalidPosts();