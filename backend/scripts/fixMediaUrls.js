require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Get current IP from command line or use default
const OLD_IP = process.argv[2] || '192.168.10.13';
const NEW_IP = process.argv[3] || '192.168.10.2';

console.log(`🔧 Fixing media URLs from ${OLD_IP} to ${NEW_IP}...`);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const fixMediaUrls = async () => {
  try {
    await connectDB();

    // Get all collections that might have media URLs
    const Post = require('../models/Post');
    const WhisperPost = require('../models/WhisperPost');
    
    // Try to get Message model, skip if not available
    let Message;
    try {
      Message = require('../models/Message');
    } catch (e) {
      console.log('⚠️  Message model not found, skipping messages');
    }

    let totalFixed = 0;

    // Fix Posts
    console.log('\n📝 Fixing Posts...');
    const posts = await Post.find({
      $or: [
        { 'content.media.url': { $regex: OLD_IP } },
        { 'content.image': { $regex: OLD_IP } },
        { 'content.voiceNote': { $regex: OLD_IP } }
      ]
    });

    for (const post of posts) {
      let updated = false;

      // Fix media array
      if (post.content.media && post.content.media.length > 0) {
        post.content.media = post.content.media.map(m => ({
          ...m,
          url: m.url.replace(OLD_IP, NEW_IP)
        }));
        updated = true;
      }

      // Fix single image
      if (post.content.image && typeof post.content.image === 'string' && post.content.image.includes(OLD_IP)) {
        post.content.image = post.content.image.replace(OLD_IP, NEW_IP);
        updated = true;
      }

      // Fix voice note
      if (post.content.voiceNote && typeof post.content.voiceNote === 'string' && post.content.voiceNote.includes(OLD_IP)) {
        post.content.voiceNote = post.content.voiceNote.replace(OLD_IP, NEW_IP);
        updated = true;
      }

      if (updated) {
        await post.save({ validateBeforeSave: false });
        totalFixed++;
        console.log(`  ✓ Fixed post ${post._id}`);
      }
    }

    // Fix WhisperPosts
    console.log('\n🔮 Fixing WhisperPosts...');
    const whisperPosts = await WhisperPost.find({
      'content.media.url': { $regex: OLD_IP }
    });

    for (const post of whisperPosts) {
      if (post.content.media && post.content.media.length > 0) {
        post.content.media = post.content.media.map(m => ({
          ...m,
          url: m.url.replace(OLD_IP, NEW_IP)
        }));
        await post.save({ validateBeforeSave: false });
        totalFixed++;
        console.log(`  ✓ Fixed whisper post ${post._id}`);
      }
    }

    // Fix Messages
    let messages = [];
    if (Message) {
      console.log('\n💬 Fixing Messages...');
      messages = await Message.find({
        'media.url': { $regex: OLD_IP }
      });

      for (const message of messages) {
        if (message.media && message.media.length > 0) {
          message.media = message.media.map(m => ({
            ...m,
            url: m.url.replace(OLD_IP, NEW_IP)
          }));
          await message.save({ validateBeforeSave: false });
          totalFixed++;
          console.log(`  ✓ Fixed message ${message._id}`);
        }
      }
    }

    console.log(`\n✅ Migration complete! Fixed ${totalFixed} documents`);
    console.log(`📊 Summary:`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - WhisperPosts: ${whisperPosts.length}`);
    console.log(`   - Messages: ${messages.length}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

fixMediaUrls();
