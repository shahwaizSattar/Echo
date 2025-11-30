const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./models/User');
const WhisperPost = require('./models/WhisperPost');

async function findWhisperOwner() {
  try {
    const userId = '6925c9085cac41571559e1fa';
    
    // Find user
    const user = await User.findById(userId);
    console.log('✅ User with whispers:');
    console.log('  Username:', user?.username || 'NOT FOUND');
    console.log('  _id:', userId);
    
    // Count whispers
    const whisperCount = await WhisperPost.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    console.log('  Whisper count:', whisperCount);
    
    // Check sohari
    const sohari = await User.findOne({ username: 'sohari' });
    console.log('\n✅ Sohari user:');
    console.log('  _id:', sohari?._id);
    const sohariWhispers = await WhisperPost.countDocuments({ userId: sohari._id });
    console.log('  Whisper count:', sohariWhispers);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findWhisperOwner();
