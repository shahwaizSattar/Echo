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

// Create home posts
async function createHomePosts(token, userId) {
  const homePosts = [
    {
      content: { text: 'Just discovered an amazing coffee shop in the city! ☕ The atmosphere is perfect for working.' },
      category: 'Food',
      interactions: { commentsLocked: false, reactionsLocked: false }
    },
    {
      content: { text: 'What\'s your favorite time to explore the city?' },
      category: 'Travel',
      poll: {
        enabled: true,
        type: 'multi',
        question: 'Best time for city exploration?',
        options: [
          { text: 'Early morning', votes: [], voteCount: 0 },
          { text: 'Afternoon', votes: [], voteCount: 0 },
          { text: 'Evening', votes: [], voteCount: 0 },
          { text: 'Night', votes: [], voteCount: 0 }
        ],
        totalVotes: 0
      }
    },
    {
      content: { text: 'Sharing some personal thoughts about life changes... 💭' },
      category: 'Books',
      interactions: { commentsLocked: false, reactionsLocked: true }
    }
  ];

  for (const post of homePosts) {
    try {
      const response = await axios.post(`${API_BASE}/posts`, post, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created home post: ${post.content.text.substring(0, 30)}...`);
    } catch (error) {
      console.error(`❌ Failed to create home post:`, error.response?.data || error.message);
    }
  }
}

// Create whisper posts
async function createWhisperPosts(token, userId) {
  const whisperPosts = [
    {
      content: { text: 'Secret confession: I still sleep with a nightlight 🌙' },
      category: 'Confession',
      backgroundAnimation: 'neon'
    },
    {
      content: { text: 'Anonymous tip: The best pizza is at the corner shop on 5th street 🍕' },
      category: 'Food',
      backgroundAnimation: 'mist'
    },
    {
      content: { text: 'Sometimes I pretend to be busy just to avoid small talk in elevators' },
      category: 'Confession',
      backgroundAnimation: 'rain'
    }
  ];

  for (const post of whisperPosts) {
    try {
      const response = await axios.post(`${API_BASE}/whisperwall`, post, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created whisper post: ${post.content.text.substring(0, 30)}...`);
    } catch (error) {
      console.error(`❌ Failed to create whisper post:`, error.response?.data || error.message);
    }
  }
}

// Send messages between users
async function sendMessages(senderToken, receiverId, messages) {
  for (const message of messages) {
    try {
      const response = await axios.post(`${API_BASE}/chat/messages/${receiverId}`, {
        text: message.text,
        media: message.media || []
      }, {
        headers: { Authorization: `Bearer ${senderToken}` }
      });
      console.log(`✅ Sent message: ${message.text.substring(0, 30)}...`);
    } catch (error) {
      console.error(`❌ Failed to send message:`, error.response?.data || error.message);
    }
  }
}

async function main() {
  console.log('🚀 Creating comprehensive test content...\n');

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

  console.log('\n📝 Creating home posts...');
  // Create home posts for each user
  for (const user of userTokens) {
    await createHomePosts(user.token, user.id);
  }

  console.log('\n👻 Creating whisper posts...');
  // Create whisper posts for each user
  for (const user of userTokens) {
    await createWhisperPosts(user.token, user.id);
  }

  console.log('\n💬 Creating messages...');
  // Create messages between users
  const messageTypes = [
    { text: 'Hey! How are you doing?' },
    { text: 'Want to grab coffee sometime?' },
    { text: 'Did you see that amazing sunset yesterday?' },
    { text: 'Check out this cool photo!', media: [{ type: 'image', url: 'https://picsum.photos/400/300?random=1' }] }
  ];

  // Send messages between users
  for (let i = 0; i < userTokens.length; i++) {
    for (let j = i + 1; j < userTokens.length; j++) {
      const sender = userTokens[i];
      const receiver = userTokens[j];
      
      // Send 2-3 messages each way
      const messagesToSend = messageTypes.slice(0, Math.floor(Math.random() * 2) + 2);
      await sendMessages(sender.token, receiver.id, messagesToSend);
      
      // Send some back
      const messagesToSendBack = messageTypes.slice(2, Math.floor(Math.random() * 2) + 4);
      await sendMessages(receiver.token, sender.id, messagesToSendBack);
    }
  }

  console.log('\n🎉 Test content creation completed!');
  console.log('\n📋 USER CREDENTIALS FOR TESTING:');
  console.log('================================');
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   ID: ${user.id}`);
    console.log('');
  });
}

main().catch(console.error);