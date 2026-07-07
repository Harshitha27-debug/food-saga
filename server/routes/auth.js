const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple' || 'jsonwebtoken'); // Use standard jsonwebtoken
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { protect, mockUsers } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'food_saga_super_secret';

// Helper to sign JWT token
const signToken = (id) => {
  return jsonwebtoken.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (getIsConnected()) {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      user = await User.create({ name, email, password });
      const token = signToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          badges: user.badges,
          achievements: user.achievements
        }
      });
    } else {
      // Mock mode
      const exists = mockUsers.find(u => u.email === email);
      if (exists) {
        return res.status(400).json({ success: false, message: 'User already exists (Demo Mode)' });
      }

      const mockId = 'mock_' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        id: mockId,
        name,
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        streak: 3,
        badges: ['Kitchen Novice', 'First Steps'],
        achievements: [{ title: 'Signed Up!', description: 'Welcome to Food Saga', unlockedAt: new Date() }]
      };
      mockUsers.push(newUser);

      const token = signToken(mockId);
      return res.status(201).json({ success: true, token, user: newUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (getIsConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = signToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          badges: user.badges,
          achievements: user.achievements
        }
      });
    } else {
      // Mock mode
      // Let any password pass for existing mock users or create dummy
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        // Automatically create a demo user if login doesn't match to make testing fast!
        const mockId = 'mock_demo_user';
        user = {
          id: mockId,
          name: email.split('@')[0],
          email,
          role: email.includes('admin') ? 'admin' : 'user',
          streak: 5,
          badges: ['Daily Chef', 'Egg Specialist'],
          achievements: [
            { title: 'Welcome Back', description: 'Logged into Demo Mode successfully', unlockedAt: new Date() }
          ]
        };
        mockUsers.push(user);
      }

      const token = signToken(user.id);
      return res.json({ success: true, token, user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google Login/Signup
// @access  Public
router.post('/google', async (req, res) => {
  const { email, name, photoURL } = req.body;

  try {
    if (getIsConnected()) {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          password: 'google_auth_placeholder_password_xyz', // Random password
          profilePicture: photoURL
        });
      }

      const token = signToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          streak: user.streak,
          badges: user.badges,
          achievements: user.achievements,
          profilePicture: user.profilePicture
        }
      });
    } else {
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        user = {
          id: 'google_' + Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: 'user',
          profilePicture: photoURL,
          streak: 1,
          badges: ['Social Foodie'],
          achievements: [{ title: 'Google Connect', description: 'Successfully logged in with Google', unlockedAt: new Date() }]
        };
        mockUsers.push(user);
      }

      const token = signToken(user.id);
      return res.json({ success: true, token, user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, profilePicture, height, weight } = req.body;

  try {
    if (getIsConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (profilePicture) user.profilePicture = profilePicture;
      // We can also attach meta fields to User
      await user.save();

      return res.json({ success: true, user });
    } else {
      // Mock update
      const user = mockUsers.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found in Demo' });
      }

      if (name) user.name = name;
      if (profilePicture) user.profilePicture = profilePicture;
      return res.json({ success: true, user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/streak
// @desc    Record cooking completion & increment streak
// @access  Private
router.post('/streak', protect, async (req, res) => {
  try {
    const today = new Date().toDateString();

    if (getIsConnected()) {
      const user = await User.findById(req.user.id);

      if (user.lastCookingDate && user.lastCookingDate.toDateString() === today) {
        return res.json({ success: true, message: 'Cooking already logged for today!', streak: user.streak });
      }

      // Check if last cooking date was yesterday to continue streak, else reset to 1
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (user.lastCookingDate && user.lastCookingDate.toDateString() === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }

      user.lastCookingDate = new Date();

      // Check achievements/badges
      if (user.streak === 5 && !user.badges.includes('Streak Master 5')) {
        user.badges.push('Streak Master 5');
        user.achievements.push({
          title: 'Flame Keeper',
          description: 'Cooked 5 days in a row!'
        });
      }

      await user.save();
      return res.json({ success: true, streak: user.streak, badges: user.badges, achievements: user.achievements });
    } else {
      // Mock update
      const user = mockUsers.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.streak = (user.streak || 0) + 1;
      if (user.streak === 6 && !user.badges.includes('Streak Master')) {
        user.badges.push('Streak Master');
        user.achievements.push({ title: 'Continuous Spark', description: 'Maintained cooking streak' });
      }

      return res.json({ success: true, streak: user.streak, badges: user.badges, achievements: user.achievements });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
