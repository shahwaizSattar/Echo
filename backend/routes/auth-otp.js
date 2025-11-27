const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, storeOTP, verifyOTP, deleteOTP } = require('../utils/otpService');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

const router = express.Router();

const generateToken = (userId, expiresIn = '1h') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

// ===== SIGNUP - STEP 1: REQUEST OTP =====
router.post('/signup-request-otp', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 12);

    await storeOTP(email, otp, 'signup', hashedPassword);

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP sent to email',
      email
    });
  } catch (error) {
    console.error('Signup OTP request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== SIGNUP - STEP 2: VERIFY OTP & CREATE ACCOUNT =====
router.post('/signup-verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('username').isLength({ min: 3, max: 30 }),
  body('preferences').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { email, otp, username, preferences, avatar } = req.body;

    const verification = await verifyOTP(email, otp, 'signup');
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: verification.message 
      });
    }

    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otpRecord = verification.record;

    const user = new User({
      email: email.toLowerCase(),
      password: otpRecord.tempPassword,
      username,
      preferences: preferences.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()),
      avatar: avatar || null,
      isVerified: true,
      badges: [{ name: 'Welcome Aboard!', icon: '🎉', earnedAt: new Date() }]
    });

    await user.save();

    await deleteOTP(email, 'signup');

    const accessToken = generateToken(user._id, '1h');
    const refreshToken = generateRefreshToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ 
      success: true, 
      message: 'Account created successfully',
      accessToken,
      refreshToken,
      user: userData
    });
  } catch (error) {
    console.error('Signup verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== LOGIN =====
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account not verified' });
    }

    await user.updateLastActive();

    const accessToken = generateToken(user._id, '1h');
    const refreshToken = generateRefreshToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    res.json({ 
      success: true, 
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== FORGOT PASSWORD - STEP 1: REQUEST OTP =====
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'forgot-password');

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP sent to email',
      email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== FORGOT PASSWORD - STEP 2: VERIFY OTP =====
router.post('/forgot-password/verify', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { email, otp } = req.body;

    const verification = await verifyOTP(email, otp, 'forgot-password');
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: verification.message 
      });
    }

    res.json({ 
      success: true, 
      message: 'OTP verified',
      email
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== FORGOT PASSWORD - STEP 3: RESET PASSWORD =====
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { email, otp, newPassword } = req.body;

    const verification = await verifyOTP(email, otp, 'forgot-password');
    if (!verification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: verification.message 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await deleteOTP(email, 'forgot-password');

    res.json({ 
      success: true, 
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ===== VERIFY TOKEN =====
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Token is valid', user });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== REFRESH TOKEN =====
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAccessToken = generateToken(user._id, '1h');
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    console.error('Token refresh error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
