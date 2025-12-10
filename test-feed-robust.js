const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFeedRobust() {
  try {
    console.log('🧪 Testing home feed (robust)...\n');

    // Login as alex_explorer
    console.log('🔐 Logging in as alex_explorer...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'alex@test.com',
      password: 'test123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get home feed
    console.log('\n📱 Fetching home feed...');
    const feedResponse = await axios.get(`${API_BASE}/posts/feed?limit=50`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const posts = feedResponse.data.posts;
    console.log(`✅ Retrieved ${posts.length} posts`);

    // Analyze posts safely
    const authorStats = {};
    const validPosts = [];
    const invalidPosts = [];

    posts.forEach((post, index) => {
      if (post && post.author && post.author.username) {
        const author = post.author.username;
        authorStats[author] = (authorStats[author] || 0) + 1;
        validPosts.push(post);
      } else {
        invalidPosts.push({ index, post: post ? 'Missing author' : 'Null post' });
      }
    });

    console.log(`\n📊 Valid posts: ${validPosts.length}`);
    console.log(`❌ Invalid posts: ${invalidPosts.length}`);

    if (invalidPosts.length > 0) {
      console.log('Invalid posts details:', invalidPosts.slice(0, 3));
    }

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
    } else if (uniqueAuthors.length === 1) {
      console.log('⚠️  WARNING: Home feed only shows posts from one user');
    } else {
      console.log('❌ ERROR: No valid posts found');
    }

    // Show sample valid posts
    if (validPosts.length > 0) {
      console.log('\n📝 Sample Valid Posts:');
      console.log('======================');
      validPosts.slice(0, 5).forEach((post, index) => {
        console.log(`${index + 1}. ${post.author.username}: ${post.content.text.substring(0, 60)}...`);
        console.log(`   Category: ${post.category} | Reactions: ${post.reactionCounts.total}`);
        console.log(`   Avatar: ${post.author.avatar ? 'DiceBear URL' : 'No avatar'}`);
        console.log('');
      });
    }

    // Test explore endpoint for comparison
    console.log('\n🔍 Testing explore endpoint for comparison...');
    const exploreResponse = await axios.get(`${API_BASE}/posts/explore?limit=20`);
    const explorePosts = exploreResponse.data.posts;
    
    const exploreAuthorStats = {};
    explorePosts.forEach(post => {
      if (post && post.author && post.author.username) {
        const author = post.author.username;
        exploreAuthorStats[author] = (exploreAuthorStats[author] || 0) + 1;
      }
    });

    console.log('\n📊 Explore Posts by Author:');
    Object.entries(exploreAuthorStats).forEach(([author, count]) => {
      console.log(`${author}: ${count} posts`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFeedRobust();