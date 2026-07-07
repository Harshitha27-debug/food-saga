const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const MealPlan = require('../models/MealPlan');
const { getIsConnected } = require('../config/db');
const { protect, authorize, mockUsers } = require('../middleware/auth');
const { mockRecipes } = require('../utils/mockData');
const { customMockRecipes } = require('./recipes');

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics metrics
// @access  Private/Admin (Demo mode is open for easy demonstration)
router.get('/analytics', protect, async (req, res) => {
  try {
    let totalUsers = 125;
    let totalRecipes = 58;
    let totalReviews = 342;
    let mealPlansScheduled = 85;

    if (getIsConnected()) {
      totalUsers = await User.countDocuments();
      totalRecipes = await Recipe.countDocuments();
      totalReviews = await Review.countDocuments();
      mealPlansScheduled = await MealPlan.countDocuments();
    } else {
      totalUsers = mockUsers.length + 15; // padding for demonstration
      totalRecipes = mockRecipes.length + customMockRecipes.length;
      totalReviews = 45;
      mealPlansScheduled = 24;
    }

    // Category distribution
    const categoryStats = [
      { name: 'Breakfast', count: 12, percentage: 20 },
      { name: 'Main Course', count: 24, percentage: 41 },
      { name: 'Salads & Greens', count: 8, percentage: 14 },
      { name: 'Seafood', count: 6, percentage: 10 },
      { name: 'Desserts', count: 8, percentage: 15 }
    ];

    // Activity stats over past 6 months
    const signupsTrend = [
      { month: 'Jan', signups: 10, recipesCreated: 4 },
      { month: 'Feb', signups: 22, recipesCreated: 7 },
      { month: 'Mar', signups: 35, recipesCreated: 12 },
      { month: 'Apr', signups: 54, recipesCreated: 18 },
      { month: 'May', signups: 80, recipesCreated: 22 },
      { month: 'Jun', signups: totalUsers, recipesCreated: totalRecipes }
    ];

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalRecipes,
        totalReviews,
        mealPlansScheduled,
        categoryStats,
        signupsTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get list of all users
// @access  Private/Admin
router.get('/users', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const users = await User.find({}).select('-password');
      return res.json({ success: true, data: users });
    } else {
      // Mock mode
      return res.json({ success: true, data: mockUsers });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Toggle user role (user/admin)
// @access  Private/Admin
router.put('/users/:id/role', protect, async (req, res) => {
  const { role } = req.body;

  try {
    if (getIsConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      
      user.role = role;
      await user.save();
      return res.json({ success: true, data: user });
    } else {
      const user = mockUsers.find(u => u.id === req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.role = role;
      return res.json({ success: true, data: user });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account
// @access  Private/Admin
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      await User.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'User deleted' });
    } else {
      const index = mockUsers.findIndex(u => u.id === req.params.id);
      if (index === -1) return res.status(404).json({ success: false, message: 'User not found' });

      mockUsers.splice(index, 1);
      return res.json({ success: true, message: 'User deleted' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
