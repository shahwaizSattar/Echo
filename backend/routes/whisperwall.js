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

    const { content, category, tags, backgroundAnimation } = req.body;

    if (!content.text?.trim() && (!content.media || content.media.length === 0)) {
      console.log('❌ No content provided');
      return res.status(400).json({
        success: false,
        message: 'Whisper must have either text or media'
      });
    }

    const whisperPost = new WhisperPost({
      content,
      category,
      tags: tags || [],
      backgroundAnimation: backgroundAnimation || 'none',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await whisperPost.save();
    console.log('✅ Whisper created:', whisperPost._id);

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

    const whispers = await WhisperPost.find(matchCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(parseInt(limit));

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

module.exports = router;
