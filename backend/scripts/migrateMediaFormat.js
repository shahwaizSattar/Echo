const mongoose = require('mongoose');
const Post = require('../models/Post');

// Migration script to convert old content.image format to content.media array format
async function migrateMediaFormat() {
  try {
    console.log('🔄 Starting media format migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperwall');
    console.log('✅ Connected to MongoDB\n');
    
    // Find all posts with content.image but no content.media
    const postsToMigrate = await Post.find({
      'content.image': { $exists: true, $ne: null },
      $or: [
        { 'content.media': { $exists: false } },
        { 'content.media': { $size: 0 } }
      ]
    });
    
    console.log(`📊 Found ${postsToMigrate.length} posts to migrate\n`);
    
    if (postsToMigrate.length === 0) {
      console.log('✅ No posts need migration. All posts are up to date!');
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const post of postsToMigrate) {
      try {
        // Convert content.image to content.media array
        post.content.media = [{
          url: post.content.image,
          type: 'image',
          filename: `legacy-image-${post._id}`,
          originalName: 'image',
          size: 0
        }];
        
        // Keep the old image field for backward compatibility (optional)
        // post.content.image = null; // Uncomment to remove old field
        
        await post.save();
        successCount++;
        
        console.log(`✅ Migrated post ${post._id} (${successCount}/${postsToMigrate.length})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate post ${post._id}:`, error.message);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} posts`);
    console.log(`   ❌ Failed: ${errorCount} posts`);
    console.log(`   📈 Total processed: ${postsToMigrate.length} posts\n`);
    
    if (successCount > 0) {
      console.log('🎉 Migration completed successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateMediaFormat();
