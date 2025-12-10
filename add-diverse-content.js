const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// User credentials
const users = [
  { username: 'alex_explorer', email: 'alex@test.com', password: 'test123', id: '693912526091fdd87fe4d7e6' },
  { username: 'maya_creative', email: 'maya@test.com', password: 'test123', id: '693912526091fdd87fe4d7e8' },
  { username: 'sam_techie', email: 'sam@test.com', password: 'test123', id: '693912526091fdd87fe4d7ea' },
  { username: 'zoe_foodie', email: 'zoe@test.com', password: 'test123', id: '693912526091fdd87fe4d7ec' }
];

// Login and get tokens
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data || error.message);
    return null;
  }
}

// Create diverse home posts
async function createDiverseHomePosts(token, username) {
  const diversePosts = [
    // Poll post
    {
      content: { text: 'Which programming language should I learn next?' },
      category: 'Technology',
      poll: {
        enabled: true,
        type: 'multi',
        question: 'Best language for beginners?',
        options: [
          { text: 'Python', votes: [], voteCount: 0 },
          { text: 'JavaScript', votes: [], voteCount: 0 },
          { text: 'Java', votes: [], voteCount: 0 },
          { text: 'Go', votes: [], voteCount: 0 }
        ],
        totalVotes: 0,
        isAnonymous: true
      }
    },
    // Locked reactions post
    {
      content: { text: 'Sometimes I feel overwhelmed by social media. Anyone else? 😔' },
      category: 'Books',
      interactions: { commentsLocked: false, reactionsLocked: true }
    },
    // Locked comments post
    {
      content: { text: 'Just finished reading "The Midnight Library" - what a journey! 📚✨' },
      category: 'Books',
      interactions: { commentsLocked: true, reactionsLocked: false }
    },
    // Media post
    {
      content: { 
        text: 'Beautiful sunset from my balcony today! 🌅',
        media: [{
          url: 'https://picsum.photos/800/600?random=5',
          type: 'image',
          filename: 'sunset.jpg',
          originalName: 'sunset.jpg',
          size: 250000
        }]
      },
      category: 'Photography'
    },
    // Gaming post
    {
      content: { text: 'Just hit level 50 in my favorite RPG! The grind was real but so worth it 🎮' },
      category: 'Gaming'
    },
    // Food post
    {
      content: { text: 'Tried making homemade pasta for the first time. It was... an adventure 😅🍝' },
      category: 'Food'
    }
  ];

  for (const post of diversePosts) {
    try {
      const response = await axios.post(`${API_BASE}/posts`, post, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ ${username} created: ${post.content.text.substring(0, 40)}...`);
    } catch (error) {
      console.error(`❌ Failed to create post for ${username}:`, error.response?.data || error.message);
    }
  }
}

// Create diverse whisper posts
async function createDiverseWhisperPosts(token, username) {
  const diverseWhispers = [
    // Timed whisper
    {
      content: { text: 'I secretly judge people by their music taste when they play it out loud 🎵' },
      category: 'Confession',
      backgroundAnimation: 'neon',
      vanishMode: {
        enabled: true,
        duration: '12hours'
      }
    },
    // One-time whisper
    {
      content: { text: 'Plot twist: What if déjà vu is just your parallel universe self doing the same thing? 🤯' },
      category: 'Random',
      backgroundAnimation: 'mist',
      oneTime: {
        enabled: true,
        viewedBy: []
      }
    },
    // Advice whisper
    {
      content: { text: 'Pro tip: If you\'re feeling anxious, try the 5-4-3-2-1 grounding technique. It really works!' },
      category: 'Advice',
      backgroundAnimation: 'hearts'
    },
    // Love whisper
    {
      content: { text: 'Sometimes I write love letters I never send. Maybe that\'s okay.' },
      category: 'Love',
      backgroundAnimation: 'rain'
    },
    // Vent whisper
    {
      content: { text: 'Why do people ghost instead of just saying they\'re not interested? Communication isn\'t that hard!' },
      category: 'Vent',
      backgroundAnimation: 'fire'
    }
  ];

  for (const whisper of diverseWhispers) {
    try {
      const response = await axios.post(`${API_BASE}/whisperwall`, whisper, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ ${username} whispered: ${whisper.content.text.substring(0, 40)}...`);
    } catch (error) {
      console.error(`❌ Failed to create whisper for ${username}:`, error.response?.data || error.message);
    }
  }
}

// Send diverse messages
async function sendDiverseMessages(senderToken, senderName, receiverId, receiverName) {
  const diverseMessages = [
    { text: `Hey ${receiverName}! How's your day going?` },
    { text: 'Just saw your latest post - totally agree!' },
    { 
      text: 'Check out this meme I found 😂',
      media: [{
        url: 'https://picsum.photos/400/400?random=6',
        type: 'image',
        filename: 'meme.jpg',
        originalName: 'funny_meme.jpg',
        size: 180000
      }]
    },
    { text: 'Want to grab lunch this weekend?' },
    { text: 'That movie recommendation was spot on! Thanks 🎬' }
  ];

  // Send 2-3 random messages
  const messagesToSend = diverseMessages.slice(0, Math.floor(Math.random() * 3) + 2);
  
  for (const message of messagesToSend) {
    try {
      const response = await axios.post(`${API_BASE}/chat/messages/${receiverId}`, {
        text: message.text,
        media: message.media || []
      }, {
        headers: { Authorization: `Bearer ${senderToken}` }
      });
      console.log(`✅ ${senderName} → ${receiverName}: ${message.text.substring(0, 30)}...`);
    } catch (error) {
      console.error(`❌ Failed to send message from ${senderName}:`, error.response?.data || error.message);
    }
  }
}

async function main() {
  console.log('🚀 Adding diverse content to test environment...\n');

  // Login all users
  const userTokens = [];
  for (const user of users) {
    const token = await loginUser(user.email, user.password);
    if (token) {
      userTokens.push({ ...user, token });
      console.log(`✅ Logged in: ${user.username}`);
    }
  }

  if (userTokens.length === 0) {
    console.error('❌ No users could be logged in');
    return;
  }

  console.log('\n📝 Creating diverse home posts...');
  // Create diverse home posts for each user
  for (const user of userTokens) {
    await createDiverseHomePosts(user.token, user.username);
  }

  console.log('\n👻 Creating diverse whisper posts...');
  // Create diverse whisper posts for each user
  for (const user of userTokens) {
    await createDiverseWhisperPosts(user.token, user.username);
  }

  console.log('\n💬 Sending more diverse messages...');
  // Send diverse messages between users
  for (let i = 0; i < userTokens.length; i++) {
    for (let j = i + 1; j < userTokens.length; j++) {
      const sender = userTokens[i];
      const receiver = userTokens[j];
      
      // Send messages both ways
      await sendDiverseMessages(sender.token, sender.username, receiver.id, receiver.username);
      await sendDiverseMessages(receiver.token, receiver.username, sender.id, sender.username);
    }
  }

  console.log('\n🎉 Diverse content creation completed!');
  console.log('\n📱 Your test environment now includes:');
  console.log('• Home posts: text, polls, locked reactions/comments, media');
  console.log('• Whisper posts: timed, one-time, confessions, advice, vents');
  console.log('• Messages: text, images, conversations between all users');
  console.log('\n📋 USER CREDENTIALS:');
  console.log('==================');
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   ID: ${user.id}`);
    console.log('');
  });
}

main().catch(console.error);