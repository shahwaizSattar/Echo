const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const WhisperPost = require('./models/WhisperPost');
const User = require('./models/User');

async function checkWhisperUserIds() {
  try {
    // Get sohari's ID
    const sohari = await User.findOne({ username: 'sohari' });
    console.log('✅ Sohari user ID:', sohari._id.toString());
    
    // Get all whispers
    const allWhispers = await WhisperPost.find({}).limit(10);
    console.log('\n📋 All whispers (showing first 10):');
    
    allWhispers.forEach((whisper, index) => {
      console.log(`\n${index + 1}. Whisper ID: ${whisper._id}`);
      console.log(`   Random Username: ${whisper.randomUsername}`);
      console.log(`   User ID: ${whisper.userId}`);
      console.log(`   User ID type: ${typeof whisper.userId}`);
      console.log(`   Content: ${whisper.content.text?.substring(0, 50) || '(no text)'}`);
      console.log(`   Is Sohari's: ${whisper.userId?.toString() === sohari._id.toString()}`);
    });
    
    // Count whispers by sohari
    const sohariWhisperCount = await WhisperPost.countDocuments({ 
      userId: sohari._id 
    });
    console.log(`\n✅ Total whispers by sohari: ${sohariWhisperCount}`);
    
    // Check if userId field exists
    const whispersWithoutUserId = await WhisperPost.countDocuments({ 
      userId: { $exists: false } 
    });
    console.log(`⚠️  Whispers without userId field: ${whispersWithoutUserId}`);
    
    // Check if userId is null
    const whispersWithNullUserId = await WhisperPost.countDocuments({ 
      userId: null 
    });
    console.log(`⚠️  Whispers with null userId: ${whispersWithNullUserId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkWhisperUserIds();
