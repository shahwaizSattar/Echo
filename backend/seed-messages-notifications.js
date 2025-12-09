const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');
const Conversation = require('./models/Conversation');
const Notification = require('./models/Notification');

// Load .env from backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Sample media URLs
const sampleImages = [
  'https://picsum.photos/800/600?random=10',
  'https://picsum.photos/800/600?random=11',
  'https://picsum.photos/800/600?random=12',
  'https://picsum.photos/800/600?random=13',
  'https://picsum.photos/800/600?random=14',
];

const sampleVideos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

const sampleAudio = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
];

// Message templates
const messageTexts = {
  text: [
    'Hey! How are you doing? 👋',
    'Did you see the latest post?',
    'That was hilarious! 😂',
    'Thanks for sharing!',
    'Let\'s catch up soon!',
    'Great content as always!',
    'This is amazing! 🔥',
    'Can\'t wait to see more!',
  ],
  withImage: [
    'Check out this photo! 📸',
    'Look what I found!',
    'Thought you\'d like this!',
    'Amazing view, right?',
  ],
  withVideo: [
    'You have to watch this! 🎥',
    'This video is incredible!',
    'Check this out!',
  ],
  withAudio: [
    'Listen to this! 🎵',
    'New voice message for you!',
    'Recorded this for you!',
  ],
};

async function seedMessagesAndNotifications() {
  try {
    console.log('💬 Starting messages and notifications seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whisperwall');
    console.log('✅ Connected to MongoDB');

    // Get existing users
    const users = await User.find().limit(5);
    if (users.length < 2) {
      console.log('❌ Not enough users found. Please run seed-comprehensive-data.js first.');
      process.exit(1);
    }
    console.log(`✅ Found ${users.length} users`);

    // Get sohari user
    const sohariUser = users.find(u => u.username === 'sohari');
    if (!sohariUser) {
      console.log('❌ Sohari user not found. Please run seed-comprehensive-data.js first.');
      process.exit(1);
    }

    // Get some posts for notifications
    const posts = await Post.find().limit(10);
    console.log(`✅ Found ${posts.length} posts`);

    // Clear existing conversations and notifications
    console.log('🗑️  Clearing existing messages and notifications...');
    await Conversation.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create conversations with messages
    console.log('\n💬 Creating conversations with messages...');
    const conversations = [];

    // 1. Conversation between sohari and each other user
    for (let i = 1; i < users.length; i++) {
      const otherUser = users[i];
      const conversation = await Conversation.create({
        participants: [sohariUser._id, otherUser._id],
        messages: [],
        lastMessageAt: new Date(),
      });

      // Add text messages
      for (let j = 0; j < 3; j++) {
        const sender = j % 2 === 0 ? sohariUser._id : otherUser._id;
        const text = messageTexts.text[Math.floor(Math.random() * messageTexts.text.length)];
        conversation.messages.push({
          sender,
          text,
          media: [],
          createdAt: new Date(Date.now() - (10 - j) * 60000), // Stagger messages
          readBy: j % 2 === 0 ? [otherUser._id] : [sohariUser._id],
        });
      }

      // Add message with image
      conversation.messages.push({
        sender: otherUser._id,
        text: messageTexts.withImage[Math.floor(Math.random() * messageTexts.withImage.length)],
        media: [{
          url: sampleImages[i % sampleImages.length],
          type: 'image',
          filename: `chat-image-${i}.jpg`,
          originalName: `photo-${i}.jpg`,
          size: 1024000,
        }],
        createdAt: new Date(Date.now() - 5 * 60000),
        readBy: [sohariUser._id],
      });

      // Add message with video (for first 2 conversations)
      if (i <= 2) {
        conversation.messages.push({
          sender: sohariUser._id,
          text: messageTexts.withVideo[Math.floor(Math.random() * messageTexts.withVideo.length)],
          media: [{
            url: sampleVideos[(i - 1) % sampleVideos.length],
            type: 'video',
            filename: `chat-video-${i}.mp4`,
            originalName: `video-${i}.mp4`,
            size: 5024000,
          }],
          createdAt: new Date(Date.now() - 3 * 60000),
          readBy: [otherUser._id],
        });
      }

      // Add message with audio (for first 2 conversations)
      if (i <= 2) {
        conversation.messages.push({
          sender: otherUser._id,
          text: messageTexts.withAudio[Math.floor(Math.random() * messageTexts.withAudio.length)],
          media: [{
            url: sampleAudio[(i - 1) % sampleAudio.length],
            type: 'audio',
            filename: `voice-note-${i}.mp3`,
            originalName: `voice-${i}.mp3`,
            size: 512000,
          }],
          createdAt: new Date(Date.now() - 2 * 60000),
          readBy: [sohariUser._id],
        });
      }

      // Add reactions to some messages
      if (conversation.messages.length > 2) {
        const messageToReact = conversation.messages[conversation.messages.length - 2];
        messageToReact.reactions = [
          {
            user: sohariUser._id,
            type: 'love',
            createdAt: new Date(),
          },
        ];
      }

      conversation.lastMessageAt = conversation.messages[conversation.messages.length - 1].createdAt;
      await conversation.save();
      conversations.push(conversation);
      
      console.log(`✅ Created conversation between sohari and ${otherUser.username} (${conversation.messages.length} messages)`);
    }

    // 2. Create notifications for sohari
    console.log('\n🔔 Creating notifications...');
    const notifications = [];

    // Reaction notifications
    for (let i = 0; i < 5; i++) {
      const post = posts[i % posts.length];
      const actor = users[(i + 1) % users.length];
      const reactionTypes = ['funny', 'love', 'shock', 'relatable', 'thinking'];
      
      const notification = await Notification.create({
        user: sohariUser._id,
        actor: actor._id,
        type: 'reaction',
        post: post._id,
        reactionType: reactionTypes[i % reactionTypes.length],
        read: i < 2, // Mark first 2 as read
        createdAt: new Date(Date.now() - (10 - i) * 60000),
      });
      
      notifications.push(notification);
      console.log(`✅ Created reaction notification from ${actor.username} (${notification.reactionType})`);
    }

    // Comment notifications
    for (let i = 0; i < 5; i++) {
      const post = posts[(i + 5) % posts.length];
      const actor = users[(i + 2) % users.length];
      const commentTexts = [
        'Great post!',
        'This is amazing! 🔥',
        'Love this content!',
        'Thanks for sharing!',
        'So relatable!',
      ];
      
      const notification = await Notification.create({
        user: sohariUser._id,
        actor: actor._id,
        type: 'comment',
        post: post._id,
        metadata: {
          commentContent: commentTexts[i % commentTexts.length],
        },
        read: i < 1, // Mark first one as read
        createdAt: new Date(Date.now() - (5 - i) * 60000),
      });
      
      notifications.push(notification);
      console.log(`✅ Created comment notification from ${actor.username}`);
    }

    // 3. Create notifications for other users (from sohari's actions)
    console.log('\n🔔 Creating notifications for other users...');
    
    for (let i = 1; i < users.length; i++) {
      const otherUser = users[i];
      const userPosts = posts.filter(p => p.author.equals(otherUser._id));
      
      if (userPosts.length > 0) {
        // Reaction notification
        const notification = await Notification.create({
          user: otherUser._id,
          actor: sohariUser._id,
          type: 'reaction',
          post: userPosts[0]._id,
          reactionType: 'love',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60000),
        });
        
        notifications.push(notification);
        console.log(`✅ Created reaction notification for ${otherUser.username} from sohari`);
        
        // Comment notification
        const commentNotification = await Notification.create({
          user: otherUser._id,
          actor: sohariUser._id,
          type: 'comment',
          post: userPosts[0]._id,
          metadata: {
            commentContent: 'Awesome post! Keep it up! 🚀',
          },
          read: false,
          createdAt: new Date(Date.now() - 1 * 60000),
        });
        
        notifications.push(commentNotification);
        console.log(`✅ Created comment notification for ${otherUser.username} from sohari`);
      }
    }

    // Summary
    console.log('\n✅ Messages and notifications seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   💬 Conversations created: ${conversations.length}`);
    console.log(`   📝 Total messages: ${conversations.reduce((sum, c) => sum + c.messages.length, 0)}`);
    console.log(`   📸 Messages with images: ${conversations.reduce((sum, c) => sum + c.messages.filter(m => m.media.some(med => med.type === 'image')).length, 0)}`);
    console.log(`   🎥 Messages with videos: ${conversations.reduce((sum, c) => sum + c.messages.filter(m => m.media.some(med => med.type === 'video')).length, 0)}`);
    console.log(`   🎤 Messages with audio: ${conversations.reduce((sum, c) => sum + c.messages.filter(m => m.media.some(med => med.type === 'audio')).length, 0)}`);
    console.log(`   🔔 Notifications created: ${notifications.length}`);
    console.log(`   ❤️ Reaction notifications: ${notifications.filter(n => n.type === 'reaction').length}`);
    console.log(`   💬 Comment notifications: ${notifications.filter(n => n.type === 'comment').length}`);
    console.log(`   📬 Unread notifications for sohari: ${notifications.filter(n => n.user.equals(sohariUser._id) && !n.read).length}`);
    
    console.log(`\n🔐 Login credentials:`);
    console.log(`   Email: sohari@example.com`);
    console.log(`   Password: password123`);
    console.log(`\n💡 Test the features:`);
    console.log(`   1. Login as sohari`);
    console.log(`   2. Check Messages screen - see conversations with media`);
    console.log(`   3. Check Notifications bell - see reaction and comment notifications`);
    console.log(`   4. Open a conversation - see images, videos, and audio messages`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding messages and notifications:', error);
    process.exit(1);
  }
}

// Run the seeding
seedMessagesAndNotifications();
