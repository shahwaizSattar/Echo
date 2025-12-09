const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperecho', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB\n');
  
  try {
    const Post = mongoose.connection.collection('posts');
    
    // Find posts with old IP in voice notes or media
    const posts = await Post.find({
      $or: [
        { 'content.voiceNote.url': { $regex: '172\\.20\\.10\\.3:5000' } },
        { 'content.media.url': { $regex: '172\\.20\\.10\\.3:5000' } }
      ]
    }).toArray();
    
    console.log(`Found ${posts.length} posts to fix\n`);
    
    for (const post of posts) {
      let modified = false;
      
      // Fix voice note
      if (post.content?.voiceNote?.url && post.content.voiceNote.url.includes('172.20.10.3:5000')) {
        const match = post.content.voiceNote.url.match(/\/uploads\/.+$/);
        if (match) {
          console.log(`Post ${post._id}:`);
          console.log(`  Voice: ${post.content.voiceNote.url}`);
          console.log(`      -> ${match[0]}\n`);
          post.content.voiceNote.url = match[0];
          modified = true;
        }
      }
      
      // Fix media
      if (post.content?.media && Array.isArray(post.content.media)) {
        post.content.media.forEach(media => {
          if (media.url && media.url.includes('172.20.10.3:5000')) {
            const match = media.url.match(/\/uploads\/.+$/);
            if (match) {
              console.log(`Post ${post._id}:`);
              console.log(`  Media: ${media.url}`);
              console.log(`      -> ${match[0]}\n`);
              media.url = match[0];
              modified = true;
            }
          }
        });
      }
      
      if (modified) {
        await Post.updateOne(
          { _id: post._id },
          { $set: { content: post.content } }
        );
        console.log(`✅ Updated post ${post._id}\n`);
      }
    }
    
    console.log('🎉 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
});
