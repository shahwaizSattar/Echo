require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Import models
const Post = require('./models/Post');
const WhisperPost = require('./models/WhisperPost');

const OLD_IP = process.argv[2] || '192.168.10.2';
const NEW_IP = process.env.SERVER_IP || '172.20.10.2';

async function fixMediaUrls() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix regular posts
    console.log('\n📝 Checking regular posts...');
    const posts = await Post.find({
      $or: [
        { 'content.media.url': { $regex: OLD_IP } },
        { 'content.image': { $regex: OLD_IP } },
        { 'content.voiceNote.url': { $regex: OLD_IP } }
      ]
    });

    console.log(`Found ${posts.length} posts with old IP addresses`);

    for (const post of posts) {
      let updated = false;

      // Fix media array URLs
      if (post.content.media && Array.isArray(post.content.media)) {
        post.content.media.forEach(media => {
          if (media.url && media.url.includes(OLD_IP)) {
            media.url = media.url.replace(OLD_IP, NEW_IP);
            updated = true;
          }
        });
      }

      // Fix legacy image URL
      if (post.content.image && post.content.image.includes(OLD_IP)) {
        post.content.image = post.content.image.replace(OLD_IP, NEW_IP);
        updated = true;
      }

      // Fix voice note URL
      if (post.content.voiceNote && post.content.voiceNote.url && post.content.voiceNote.url.includes(OLD_IP)) {
        post.content.voiceNote.url = post.content.voiceNote.url.replace(OLD_IP, NEW_IP);
        updated = true;
      }

      if (updated) {
        try {
          // Fix any validation issues before saving
          if (post.content.voiceNote && post.content.voiceNote.effect === null) {
            delete post.content.voiceNote.effect;
          }
          await post.save();
          console.log(`✅ Updated post ${post._id}`);
        } catch (saveError) {
          console.log(`⚠️ Could not save post ${post._id}:`, saveError.message);
          // Try updating directly in database
          await Post.updateOne(
            { _id: post._id },
            { $set: post.toObject() },
            { runValidators: false }
          );
          console.log(`✅ Force updated post ${post._id}`);
        }
      }
    }

    // Fix whisper posts
    console.log('\n🔮 Checking whisper posts...');
    const whisperPosts = await WhisperPost.find({
      $or: [
        { 'content.media.url': { $regex: OLD_IP } },
        { 'content.image': { $regex: OLD_IP } }
      ]
    });

    console.log(`Found ${whisperPosts.length} whisper posts with old IP addresses`);

    for (const whisper of whisperPosts) {
      let updated = false;

      // Fix media array URLs
      if (whisper.content.media && Array.isArray(whisper.content.media)) {
        whisper.content.media.forEach(media => {
          if (media.url && media.url.includes(OLD_IP)) {
            media.url = media.url.replace(OLD_IP, NEW_IP);
            updated = true;
          }
        });
      }

      // Fix legacy image URL
      if (whisper.content.image && whisper.content.image.includes(OLD_IP)) {
        whisper.content.image = whisper.content.image.replace(OLD_IP, NEW_IP);
        updated = true;
      }

      if (updated) {
        await whisper.save();
        console.log(`✅ Updated whisper ${whisper._id}`);
      }
    }

    console.log('\n🎉 Media URL fix completed!');
    console.log(`📊 Updated ${posts.length} regular posts and ${whisperPosts.length} whisper posts`);

  } catch (error) {
    console.error('❌ Error fixing media URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixMediaUrls();