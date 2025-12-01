require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');

// Import models
const Post = require('./models/Post');
const WhisperPost = require('./models/WhisperPost');

const OLD_URLS = [
  'http://192.168.10.13:5000',
  'http://172.20.10.2:5000', 
  'http://localhost:5000',
  'http://10.0.2.2:5000'
];
const NEW_URL = 'https://echo-yddc.onrender.com';

async function fixProductionUrls() {
  try {
    console.log('🔧 Connecting to production database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to production database');

    let totalUpdated = 0;

    for (const oldUrl of OLD_URLS) {
      console.log(`\n🔍 Checking for URLs with: ${oldUrl}`);
      
      // Escape special regex characters
      const escapedUrl = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Fix regular posts
      const posts = await Post.find({
        $or: [
          { 'content.media.url': { $regex: escapedUrl } },
          { 'content.image': { $regex: escapedUrl } },
          { 'content.voiceNote.url': { $regex: escapedUrl } }
        ]
      });

      console.log(`Found ${posts.length} regular posts with ${oldUrl}`);

      for (const post of posts) {
        let updated = false;

        // Fix media array URLs
        if (post.content.media && Array.isArray(post.content.media)) {
          post.content.media.forEach(media => {
            if (media.url && media.url.includes(oldUrl)) {
              const oldMediaUrl = media.url;
              media.url = media.url.replace(oldUrl, NEW_URL);
              console.log(`  📸 Media: ${oldMediaUrl} → ${media.url}`);
              updated = true;
            }
          });
        }

        // Fix legacy image URL
        if (post.content.image && post.content.image.includes(oldUrl)) {
          const oldImageUrl = post.content.image;
          post.content.image = post.content.image.replace(oldUrl, NEW_URL);
          console.log(`  🖼️ Image: ${oldImageUrl} → ${post.content.image}`);
          updated = true;
        }

        // Fix voice note URL
        if (post.content.voiceNote?.url && post.content.voiceNote.url.includes(oldUrl)) {
          const oldVoiceUrl = post.content.voiceNote.url;
          post.content.voiceNote.url = post.content.voiceNote.url.replace(oldUrl, NEW_URL);
          console.log(`  🎤 Voice: ${oldVoiceUrl} → ${post.content.voiceNote.url}`);
          updated = true;
        }

        if (updated) {
          try {
            await post.save();
            console.log(`✅ Updated post ${post._id}`);
            totalUpdated++;
          } catch (saveError) {
            console.log(`⚠️ Could not save post ${post._id}:`, saveError.message);
            // Try direct update
            await Post.updateOne(
              { _id: post._id },
              { $set: post.toObject() },
              { runValidators: false }
            );
            console.log(`✅ Force updated post ${post._id}`);
            totalUpdated++;
          }
        }
      }

      // Fix whisper posts
      const whisperPosts = await WhisperPost.find({
        $or: [
          { 'content.media.url': { $regex: escapedUrl } },
          { 'content.image': { $regex: escapedUrl } }
        ]
      });

      console.log(`Found ${whisperPosts.length} whisper posts with ${oldUrl}`);

      for (const whisper of whisperPosts) {
        let updated = false;

        // Fix media array URLs
        if (whisper.content.media && Array.isArray(whisper.content.media)) {
          whisper.content.media.forEach(media => {
            if (media.url && media.url.includes(oldUrl)) {
              media.url = media.url.replace(oldUrl, NEW_URL);
              updated = true;
            }
          });
        }

        // Fix legacy image URL
        if (whisper.content.image && whisper.content.image.includes(oldUrl)) {
          whisper.content.image = whisper.content.image.replace(oldUrl, NEW_URL);
          updated = true;
        }

        if (updated) {
          await whisper.save();
          console.log(`✅ Updated whisper ${whisper._id}`);
          totalUpdated++;
        }
      }
    }

    console.log('\n🎉 Production URL fix completed!');
    console.log(`📊 Total posts updated: ${totalUpdated}`);
    console.log(`🔗 All URLs now point to: ${NEW_URL}`);

  } catch (error) {
    console.error('❌ Error fixing production URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    process.exit(0);
  }
}

// Run the fix
fixProductionUrls();