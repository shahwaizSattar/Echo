const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');
const Post = require('./backend/models/Post');
const WhisperPost = require('./backend/models/WhisperPost');
const Conversation = require('./backend/models/Conversation');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cityradar';

// Test users data with DiceBear avatars
const testUsers = [
  {
    username: 'alex_explorer',
    email: 'alex@test.com',
    password: 'test123',
    bio: 'Adventure seeker and city explorer 🌟',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alex_explorer&backgroundColor=b6e3f4&eyeColor=brown&hairColor=brown&skinColor=f2d3b1'
  },
  {
    username: 'maya_creative',
    email: 'maya@test.com', 
    password: 'test123',
    bio: 'Artist and storyteller 🎨',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=maya_creative&backgroundColor=ffdfbf&eyeColor=green&hairColor=red&skinColor=edb98a'
  },
  {
    username: 'sam_techie',
    email: 'sam@test.com',
    password: 'test123', 
    bio: 'Tech enthusiast and gamer 💻',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sam_techie&backgroundColor=c0aede&eyeColor=blue&hairColor=black&skinColor=d08b5b'
  },
  {
    username: 'zoe_foodie',
    email: 'zoe@test.com',
    password: 'test123',
    bio: 'Food lover and chef 🍕',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=zoe_foodie&backgroundColor=ffd5dc&eyeColor=brown&hairColor=blonde&skinColor=f2d3b1'
  }
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearOldData() {
  console.log('🧹 Clearing old data...');
  
  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    await WhisperPost.deleteMany({});
    await Conversation.deleteMany({});
    
    console.log('✅ All old data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

async function createUsers() {
  console.log('👥 Creating test users...');
  
  const createdUsers = [];
  
  for (const userData of testUsers) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        bio: userData.bio,
        avatar: userData.avatar,
        isVerified: true
      });
      
      await user.save();
      createdUsers.push(user);
      
      console.log(`✅ Created user: ${userData.username} (ID: ${user._id})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.username}:`, error);
    }
  }
  
  return createdUsers;
}

async function createHomePosts(users) {
  console.log('🏠 Creating home screen posts...');
  
  const homePostTypes = [
    // Text posts
    {
      type: 'text',
      content: 'Just discovered an amazing coffee shop in the city! ☕ The atmosphere is perfect for working.',
      category: 'lifestyle'
    },
    {
      type: 'text', 
      content: 'Does anyone know good hiking spots around here? Looking for weekend adventure! 🥾',
      category: 'outdoor'
    },
    
    // Poll posts
    {
      type: 'poll',
      content: 'What\'s your favorite time to explore the city?',
      poll: {
        question: 'Best time for city exploration?',
        options: ['Early morning', 'Afternoon', 'Evening', 'Night'],
        votes: []
      },
      category: 'lifestyle'
    },
    {
      type: 'poll',
      content: 'Which cuisine should I try next?',
      poll: {
        question: 'Next food adventure?',
        options: ['Italian', 'Thai', 'Mexican', 'Indian'],
        votes: []
      },
      category: 'food'
    },
    
    // Locked reactions posts
    {
      type: 'text',
      content: 'Sharing some personal thoughts about life changes... 💭',
      lockedReactions: true,
      category: 'personal'
    },
    
    // Locked comments posts  
    {
      type: 'text',
      content: 'Just finished reading an amazing book! Sometimes you need quiet reflection.',
      lockedComments: true,
      category: 'books'
    },
    
    // Censored words posts
    {
      type: 'text',
      content: 'This traffic is absolutely [censored] today! Need better public transport.',
      censoredWords: ['damn', 'hell', 'crap'],
      category: 'rant'
    },
    
    // Media posts
    {
      type: 'media',
      content: 'Beautiful sunset from my balcony today! 🌅',
      media: [{
        type: 'image',
        url: 'https://picsum.photos/800/600?random=1',
        filename: 'sunset.jpg'
      }],
      category: 'photography'
    }
  ];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const postsPerUser = 3;
    
    for (let j = 0; j < postsPerUser; j++) {
      const postData = homePostTypes[(i * postsPerUser + j) % homePostTypes.length];
      
      try {
        const post = new Post({
          author: user._id,
          content: {
            text: postData.content,
            media: postData.media || []
          },
          category: postData.category,
          poll: postData.poll ? {
            enabled: true,
            type: 'multi',
            question: postData.poll.question,
            options: postData.poll.options.map(opt => ({ text: opt, votes: [], voteCount: 0 })),
            totalVotes: 0
          } : { enabled: false },
          interactions: {
            commentsLocked: postData.lockedComments || false,
            reactionsLocked: postData.lockedReactions || false
          },
          geoLocation: {
            type: 'Point',
            coordinates: [74.3587 + (Math.random() - 0.5) * 0.01, 31.5204 + (Math.random() - 0.5) * 0.01]
          },
          locationEnabled: true,
          locationName: 'Lahore, Pakistan',
          createdAt: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
        });
        
        await post.save();
        console.log(`✅ Created home post by ${user.username}: ${postData.type}`);
      } catch (error) {
        console.error(`❌ Error creating home post:`, error);
      }
    }
  }
}

async function createWhisperPosts(users) {
  console.log('👻 Creating whisper wall posts...');
  
  const whisperTypes = [
    // Timed posts
    {
      content: 'Secret confession: I still sleep with a nightlight 🌙',
      vanishAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      theme: 'midnight',
      category: 'Confession'
    },
    {
      content: 'Anonymous tip: The best pizza is at the corner shop on 5th street 🍕',
      vanishAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      theme: 'sunset',
      category: 'Food'
    },
    
    // One-time posts
    {
      content: 'Overheard at the coffee shop: "Love is like WiFi, you can\'t see it but you know when it\'s gone"',
      maxViews: 50,
      theme: 'ocean',
      category: 'Love'
    },
    {
      content: 'Random thought: What if plants are actually farming us, giving us oxygen until we decompose? 🌱',
      maxViews: 25,
      theme: 'forest',
      category: 'Random'
    },
    
    // Text whispers
    {
      content: 'Sometimes I pretend to be busy just to avoid small talk in elevators',
      theme: 'neon',
      category: 'Confession'
    },
    {
      content: 'I judge people based on how they treat service workers. It says everything.',
      theme: 'aurora',
      category: 'Advice'
    },
    
    // Media whispers
    {
      content: 'Found this mysterious note in a library book...',
      media: [{
        url: 'https://picsum.photos/600/400?random=2',
        type: 'image',
        filename: 'mystery_note.jpg',
        originalName: 'mystery_note.jpg',
        size: 150000
      }],
      theme: 'vintage',
      category: 'Random'
    },
    {
      content: 'Late night city vibes 🌃',
      media: [{
        url: 'https://picsum.photos/600/800?random=3',
        type: 'image',
        filename: 'night_city.jpg',
        originalName: 'night_city.jpg',
        size: 200000
      }],
      theme: 'cyberpunk',
      category: 'Photography'
    }
  ];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const whispersPerUser = 2;
    
    for (let j = 0; j < whispersPerUser; j++) {
      const whisperData = whisperTypes[(i * whispersPerUser + j) % whisperTypes.length];
      
      try {
        const whisper = new WhisperPost({
          userId: user._id,
          content: {
            text: whisperData.content,
            media: whisperData.media || []
          },
          category: whisperData.category || 'Random',
          backgroundAnimation: whisperData.theme === 'midnight' ? 'neon' : 
                              whisperData.theme === 'ocean' ? 'mist' : 
                              whisperData.theme === 'forest' ? 'rain' : 'none',
          vanishMode: whisperData.vanishAt ? {
            enabled: true,
            vanishAt: whisperData.vanishAt
          } : { enabled: false },
          oneTime: whisperData.maxViews ? {
            enabled: true,
            viewedBy: []
          } : { enabled: false },
          location: {
            city: 'Lahore',
            country: 'Pakistan',
            emoji: '🇵🇰'
          },
          createdAt: new Date(Date.now() - Math.random() * 86400000)
        });
        
        await whisper.save();
        console.log(`✅ Created whisper by ${user.username}: ${whisperData.type} (${whisperData.theme})`);
      } catch (error) {
        console.error(`❌ Error creating whisper:`, error);
      }
    }
  }
}

async function createMessages(users) {
  console.log('💬 Creating messages between users...');
  
  const messageTypes = [
    { text: 'Hey! How are you doing?' },
    { text: 'Want to grab coffee sometime?' },
    { text: 'Did you see that amazing sunset yesterday?' },
    { 
      text: 'Voice message',
      media: [{
        type: 'audio',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        filename: 'voice_note.wav'
      }]
    },
    {
      text: 'Check out this cool photo!',
      media: [{
        type: 'image', 
        url: 'https://picsum.photos/400/300?random=4',
        filename: 'shared_photo.jpg'
      }]
    },
    {
      text: 'Funny video I found',
      media: [{
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        filename: 'funny_video.mp4'
      }]
    }
  ];
  
  // Create conversations between users
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];
      
      try {
        // Create messages for this conversation
        const messagesCount = Math.floor(Math.random() * 4) + 2; // 2-5 messages
        const messages = [];
        
        for (let k = 0; k < messagesCount; k++) {
          const sender = k % 2 === 0 ? user1 : user2;
          const messageData = messageTypes[Math.floor(Math.random() * messageTypes.length)];
          
          const message = {
            sender: sender._id,
            text: messageData.text,
            media: messageData.media || [],
            createdAt: new Date(Date.now() - (messagesCount - k) * 3600000), // Spread over hours
            readBy: []
          };
          
          messages.push(message);
        }
        
        // Create conversation with embedded messages
        const conversation = new Conversation({
          participants: [user1._id, user2._id],
          messages: messages,
          lastMessageAt: messages[messages.length - 1].createdAt
        });
        
        await conversation.save();
        
        console.log(`✅ Created conversation between ${user1.username} and ${user2.username} with ${messages.length} messages`);
      } catch (error) {
        console.error(`❌ Error creating messages:`, error);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting comprehensive data reset and seeding...\n');
  
  await connectDB();
  await clearOldData();
  
  const users = await createUsers();
  
  if (users.length > 0) {
    await createHomePosts(users);
    await createWhisperPosts(users);
    await createMessages(users);
    
    console.log('\n🎉 Data seeding completed successfully!');
    console.log('\n📋 USER CREDENTIALS:');
    console.log('==================');
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ID: ${users[index]?._id}`);
      console.log('');
    });
    
    console.log('✅ You can now test the app with these users!');
  }
  
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
}

main().catch(console.error);