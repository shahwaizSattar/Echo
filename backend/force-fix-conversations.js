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
    const Conversation = mongoose.connection.collection('conversations');
    
    // Find conversations with old IP URLs
    const conversations = await Conversation.find({
      'messages.media.url': { $regex: '172\\.20\\.10\\.3:5000' }
    }).toArray();
    
    console.log(`Found ${conversations.length} conversations to fix\n`);
    
    for (const convo of conversations) {
      let modified = false;
      
      convo.messages.forEach(message => {
        if (message.media && Array.isArray(message.media)) {
          message.media.forEach(media => {
            if (media.url && media.url.includes('172.20.10.3:5000/uploads/')) {
              const match = media.url.match(/\/uploads\/.+$/);
              if (match) {
                console.log(`Converting: ${media.url}`);
                console.log(`       to: ${match[0]}\n`);
                media.url = match[0];
                modified = true;
              }
            }
          });
        }
      });
      
      if (modified) {
        await Conversation.updateOne(
          { _id: convo._id },
          { $set: { messages: convo.messages } }
        );
        console.log(`✅ Updated conversation ${convo._id}\n`);
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
