const express = require('express');
const WhisperPost = require('../models/WhisperPost');
const { optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper to get or create session ID
const getSessionId = (req) => {
  if (!req.session.whisperSessionId) {
    req.session.whisperSessionId = require('crypto').randomBytes(16).toString('hex');
  }
  return req.session.whisperSessionId;
};

// POST /api/whisperwall - Create anonymous whisper
router.post('/', optionalAuth, [
  body('content.text').optional().isLength({ max: 500 }),
  body('category').notEmpty().isIn(['Gaming', 'Education', 'Beauty', 'Fitness', 'Music', 'Technology', 
    'Art', 'Food', 'Travel', 'Sports', 'Movies', 'Books', 'Fashion',
    'Photography', 'Comedy', 'Science', 'Politics', 'Business', 'Vent', 
    'Confession', 'Advice', 'Random', 'Love'])
], async (req, res) => {
  try {
    console.log('📥 Creating whisper:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, category, tags, backgroundAnimation, vanishMode, oneTime } = req.body;

    if (!content.text?.trim() && (!content.media || content.media.length === 0)) {
      console.log('❌ No content provided');
      return res.status(400).json({
        success: false,
        message: 'Whisper must have either text or media'
      });
    }

    const whisperPost = new WhisperPost({
      userId: req.user?._id, // Store user ID if authenticated
      content,
      category,
      tags: tags || [],
      backgroundAnimation: backgroundAnimation || 'none',
      vanishMode: vanishMode || { enabled: false },
      oneTime: oneTime || { enabled: false },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await whisperPost.save();
    console.log('✅ Whisper created:', whisperPost._id);

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('whispers:new', { whisper: whisperPost });
    }

    res.status(201).json({
      success: true,
      message: 'Whisper posted successfully',
      whisper: whisperPost
    });

  } catch (error) {
    console.error('❌ Create whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/whisperwall - Get all whispers
router.get('/', optionalAuth, async (req, res) => {
  try {
    console.log('📥 Getting whispers...');
    const { page = 1, limit = 20, category, filter = 'recent' } = req.query;
    const skip = (page - 1) * limit;

    let sortCriteria = {};
    let matchCriteria = { isHidden: false };

    if (category) {
      matchCriteria.category = category;
    }

    switch (filter) {
      case 'trending':
        sortCriteria = { 'trending.score': -1, createdAt: -1 };
        break;
      case 'recent':
        sortCriteria = { createdAt: -1 };
        break;
      case 'popular':
        sortCriteria = { 'reactions.total': -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    let whispers = await WhisperPost.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out one-time posts that have been viewed by this session
    const sessionId = getSessionId(req);
    whispers = whispers.filter(whisper => {
      if (whisper.oneTime.enabled && whisper.oneTime.viewedBy.includes(sessionId)) {
        return false; // Hide already viewed one-time posts
      }
      return true;
    });

    console.log(`✅ Found ${whispers.length} whispers`);

    res.json({
      success: true,
      whispers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: whispers.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get whispers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/whisperwall/:postId - Get single whisper
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const whisper = await WhisperPost.findById(postId);

    if (!whisper) {
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    res.json({
      success: true,
      whisper
    });

  } catch (error) {
    console.error('Get whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/whisperwall/:postId/react - React to whisper
router.post('/:postId/react', optionalAuth, [
  body('reactionType').notEmpty().isIn(['funny', 'rage', 'shock', 'relatable', 'love', 'thinking'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { reactionType } = req.body;
    const sessionId = getSessionId(req);

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    await whisper.addAnonymousReaction(sessionId, reactionType);

    res.json({
      success: true,
      message: 'Reaction added',
      reactions: whisper.reactions
    });

  } catch (error) {
    console.error('React to whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// DELETE /api/whisperwall/:postId/react - Remove reaction
router.delete('/:postId/react', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const sessionId = getSessionId(req);

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    await whisper.removeAnonymousReaction(sessionId);

    res.json({
      success: true,
      message: 'Reaction removed',
      reactions: whisper.reactions
    });

  } catch (error) {
    console.error('Remove whisper reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/whisperwall/:postId/comments - Add comment
router.post('/:postId/comments', optionalAuth, [
  body('content').notEmpty().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { content } = req.body;
    const sessionId = getSessionId(req);

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    await whisper.addAnonymousComment(content, sessionId);

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: whisper.comments[whisper.comments.length - 1]
    });

  } catch (error) {
    console.error('Add whisper comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/whisperwall/daily-challenge - Get daily challenge
router.get('/daily-challenge', optionalAuth, async (req, res) => {
  try {
    const challenges = [
      "What's something you regret not doing?",
      "Tell a secret no one knows.",
      "Describe your week in one sentence.",
      "What's your biggest fear?",
      "Share something that made you smile today.",
      "What would you do if you had no fear?",
      "What's a dream you've given up on?",
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const challenge = challenges[dayOfYear % challenges.length];

    res.json({
      success: true,
      challenge,
      dayOfYear
    });

  } catch (error) {
    console.error('Get daily challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/whisperwall/top-whisper - Get yesterday's top whisper (blurred)
router.get('/top-whisper', optionalAuth, async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const topWhisper = await WhisperPost.findOne({
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
      isHidden: false
    })
    .sort({ 'reactions.total': -1 })
    .limit(1);

    if (!topWhisper) {
      return res.json({
        success: true,
        topWhisper: null
      });
    }

    // Return blurred version
    const blurredWhisper = {
      category: topWhisper.category,
      preview: topWhisper.content.text.substring(0, 20) + '...',
      reactionCount: topWhisper.reactions.total
    };

    res.json({
      success: true,
      topWhisper: blurredWhisper
    });

  } catch (error) {
    console.error('Get top whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/whisperwall/mood-weather - Get mood-based weather
router.get('/mood-weather', optionalAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whispers = await WhisperPost.find({
      createdAt: { $gte: today },
      isHidden: false
    });

    // Count categories to determine mood
    const categoryCounts = {};
    whispers.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });

    // Determine dominant mood
    let mood = 'calm';
    let weather = 'clear';

    const sadCategories = ['Vent', 'Confession'];
    const hypeCategories = ['Gaming', 'Sports', 'Music'];
    const loveCategories = ['Love', 'Beauty'];

    const sadCount = sadCategories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0);
    const hypeCount = hypeCategories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0);
    const loveCount = loveCategories.reduce((sum, cat) => sum + (categoryCounts[cat] || 0), 0);

    if (sadCount > hypeCount && sadCount > loveCount) {
      mood = 'melancholic';
      weather = 'rain';
    } else if (hypeCount > sadCount && hypeCount > loveCount) {
      mood = 'energetic';
      weather = 'sparkles';
    } else if (loveCount > sadCount && loveCount > hypeCount) {
      mood = 'romantic';
      weather = 'hearts';
    }

    res.json({
      success: true,
      mood,
      weather,
      stats: {
        totalWhispers: whispers.length,
        categoryCounts
      }
    });

  } catch (error) {
    console.error('Get mood weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// POST /api/whisperwall/:postId/mark-viewed - Mark one-time whisper as viewed
router.post('/:postId/mark-viewed', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const sessionId = getSessionId(req);

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    if (!whisper.oneTime.enabled) {
      return res.status(400).json({
        success: false,
        message: 'This whisper is not a one-time post'
      });
    }

    // Check if already viewed
    if (!whisper.oneTime.viewedBy.includes(sessionId)) {
      whisper.oneTime.viewedBy.push(sessionId);
      await whisper.save();
    }

    res.json({
      success: true,
      message: 'Whisper marked as viewed'
    });

  } catch (error) {
    console.error('Mark whisper viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/whisperwall/user/:userId - Get user's whisper posts (for profile)
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    console.log(`📥 Getting whispers for user: ${userId}`);
    console.log(`📥 User ID type: ${typeof userId}`);

    // Convert userId to ObjectId for MongoDB query
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    console.log(`📥 Converted to ObjectId: ${userObjectId}`);

    // Find whispers by this user, excluding one-time posts and expired posts
    const matchCriteria = {
      userId: userObjectId,
      isHidden: false,
      'oneTime.enabled': false, // Exclude one-time posts
      $or: [
        { 'vanishMode.enabled': false },
        { 'vanishMode.enabled': true, expiresAt: { $gt: new Date() } }
      ]
    };

    console.log(`📥 Match criteria:`, JSON.stringify(matchCriteria, null, 2));

    const whispers = await WhisperPost.find(matchCriteria)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${whispers.length} whispers for user`);
    if (whispers.length > 0) {
      console.log(`✅ First whisper:`, whispers[0]._id, whispers[0].content.text?.substring(0, 50));
    }

    res.json({
      success: true,
      whispers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: whispers.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get user whispers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/whisperwall/:postId - Edit whisper (only by author)
router.put('/:postId', require('../middleware/auth').authenticateToken, [
  body('content.text').optional().isLength({ max: 500 }),
  body('category').optional().isIn(['Random', 'Vent', 'Confession', 'Advice', 'Gaming', 'Love'])
], async (req, res) => {
  try {
    console.log('📝 Edit whisper request:', req.params.postId);
    console.log('📝 Request body:', req.body);
    console.log('📝 User:', req.user?._id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { content, category, tags, backgroundAnimation } = req.body;

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      console.log('❌ Whisper not found:', postId);
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    console.log('📝 Whisper found, userId:', whisper.userId);
    console.log('📝 Request user:', req.user?._id);

    // Check if user is the author
    if (!req.user || !whisper.userId || whisper.userId.toString() !== req.user._id.toString()) {
      console.log('❌ Authorization failed');
      console.log('   req.user:', req.user?._id);
      console.log('   whisper.userId:', whisper.userId);
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own whispers'
      });
    }

    // Update fields
    if (content) whisper.content = content;
    if (category) whisper.category = category;
    if (tags) whisper.tags = tags;
    if (backgroundAnimation) whisper.backgroundAnimation = backgroundAnimation;

    await whisper.save();

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('whispers:updated', { whisper });
    }

    res.json({
      success: true,
      message: 'Whisper updated successfully',
      whisper
    });

  } catch (error) {
    console.error('❌ Edit whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/whisperwall/:postId - Delete whisper (only by author)
router.delete('/:postId', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ Delete whisper request:', req.params.postId);
    console.log('🗑️ User:', req.user?._id);

    const { postId } = req.params;

    const whisper = await WhisperPost.findById(postId);
    if (!whisper) {
      console.log('❌ Whisper not found:', postId);
      return res.status(404).json({
        success: false,
        message: 'Whisper not found'
      });
    }

    console.log('🗑️ Whisper found, userId:', whisper.userId);
    console.log('🗑️ Request user:', req.user?._id);

    // Check if user is the author
    if (!req.user || !whisper.userId || whisper.userId.toString() !== req.user._id.toString()) {
      console.log('❌ Authorization failed');
      console.log('   req.user:', req.user?._id);
      console.log('   whisper.userId:', whisper.userId);
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own whispers'
      });
    }

    await WhisperPost.findByIdAndDelete(postId);

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('whispers:deleted', { postId });
    }

    res.json({
      success: true,
      message: 'Whisper deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete whisper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
