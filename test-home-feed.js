const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'alex@test.com',
  password: 'test123'
};

async function testHomeFeed() {
  try {
    console.log('🧪 Testing home feed diversity...\n');

    // Login as alex_explorer
    console.log('🔐 Logging in as alex_explorer...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get home feed
    console.log('\n📱 Fetching home feed...');
    const feedResponse = await axios.get(`${API_BASE}/posts/feed?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const posts = feedResponse.data.posts;
    console.log(`✅ Retrieved ${posts.length} posts`);

    // Analyze post authors
    const authorStats = {};
    posts.forEach(post => {
      const author = post.author.username;
      authorStats[author] = (authorStats[author] || 0) + 1;
    });

    console.log('\n📊 Posts by Author:');
    console.log('==================');
    Object.entries(authorStats).forEach(([author, count]) => {
      console.log(`${author}: ${count} posts`);
    });

    // Check if we have posts from multiple users
    const uniqueAuthors = Object.keys(authorStats);
    console.log(`\n👥 Unique authors: ${uniqueAuthors.length}`);
    
    if (uniqueAuthors.length > 1) {
      console.log('✅ SUCCESS: Home feed shows posts from multiple users!');
    } else {
      console.log('❌ ISSUE: Home feed only shows posts from one user');
    }

    // Show sample posts
    console.log('\n📝 Sample Posts:');
    console.log('================');
    posts.slice(0, 5).forEach((post, index) => {
      console.log(`${index + 1}. ${post.author.username}: ${post.content.text.substring(0, 60)}...`);
      console.log(`   Category: ${post.category} | Reactions: ${post.reactionCounts.total}`);
      console.log(`   Avatar: ${post.author.avatar ? 'DiceBear URL' : 'No avatar'}`);
      console.log('');
    });

    // Test avatar URLs
    console.log('🎭 Avatar Analysis:');
    console.log('==================');
    const avatarStats = {
      dicebear: 0,
      other: 0,
      none: 0
    };

    posts.forEach(post => {
      if (!post.author.avatar) {
        avatarStats.none++;
      } else if (post.author.avatar.includes('dicebear.com')) {
        avatarStats.dicebear++;
      } else {
        avatarStats.other++;
      }
    });

    console.log(`DiceBear avatars: ${avatarStats.dicebear}`);
    console.log(`Other avatars: ${avatarStats.other}`);
    console.log(`No avatars: ${avatarStats.none}`);

    if (avatarStats.dicebear > 0) {
      console.log('✅ SUCCESS: Users have DiceBear avatars!');
    } else {
      console.log('❌ ISSUE: No DiceBear avatars found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testHomeFeed();