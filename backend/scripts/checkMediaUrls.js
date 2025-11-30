require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const checkUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Post = require('../models/Post');
    
    // Find posts with media
    const posts = await Post.find({
      'content.media.0': { $exists: true }
    }).limit(5);

    console.log(`Found ${posts.length} posts with media:\n`);
    
    posts.forEach(post => {
      console.log(`Post ID: ${post._id}`);
      if (post.content.media) {
        post.content.media.forEach((m, i) => {
          console.log(`  Media ${i}: ${m.url}`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkUrls();
