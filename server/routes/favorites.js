const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');

// Local in-memory store for favorites in demo mode
const mockFavorites = [];

// @route   GET /api/favorites
// @desc    Get user favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const favorites = await Favorite.find({ userId: req.user.id });
      return res.json({ success: true, data: favorites });
    } else {
      const userFavs = mockFavorites.filter(f => f.userId === req.user.id);
      return res.json({ success: true, data: userFavs });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/favorites
// @desc    Add a recipe to favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  const { recipeId, recipeTitle, recipeImage, cuisine, category } = req.body;

  try {
    if (getIsConnected()) {
      let favorite = await Favorite.findOne({ userId: req.user.id, recipeId });
      if (favorite) {
        return res.status(400).json({ success: false, message: 'Already favorited' });
      }

      favorite = await Favorite.create({
        userId: req.user.id,
        recipeId,
        recipeTitle,
        recipeImage,
        cuisine: cuisine || 'Unknown',
        category: category || 'Main Course'
      });

      return res.status(201).json({ success: true, data: favorite });
    } else {
      // Mock mode
      const exists = mockFavorites.find(f => f.userId === req.user.id && f.recipeId === recipeId);
      if (exists) {
        return res.status(400).json({ success: false, message: 'Already favorited' });
      }

      const newFav = {
        _id: 'fav_' + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        recipeId,
        recipeTitle,
        recipeImage,
        cuisine: cuisine || 'Unknown',
        category: category || 'Main Course'
      };
      mockFavorites.push(newFav);

      return res.status(201).json({ success: true, data: newFav });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/favorites/:recipeId
// @desc    Remove a recipe from favorites
// @access  Private
router.delete('/:recipeId', protect, async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    if (getIsConnected()) {
      const favorite = await Favorite.findOneAndDelete({ userId: req.user.id, recipeId });
      if (!favorite) {
        return res.status(404).json({ success: false, message: 'Favorite not found' });
      }
      return res.json({ success: true, message: 'Removed from favorites' });
    } else {
      // Mock mode
      const index = mockFavorites.findIndex(f => f.userId === req.user.id && f.recipeId === recipeId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Favorite not found' });
      }
      mockFavorites.splice(index, 1);
      return res.json({ success: true, message: 'Removed from favorites' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
