const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { searchMeals } = require('../utils/mealDB');

// Local in-memory list for demo mode meal plans
const localMealPlans = [];

// @route   GET /api/mealplans
// @desc    Get user meal plans
// @access  Private
router.get('/', protect, async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    if (getIsConnected()) {
      const query = { userId: req.user._id };

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const mealPlans = await MealPlan.find(query).sort('date');
      return res.json({ success: true, data: mealPlans });
    } else {
      // Mock mode
      let userPlans = localMealPlans.filter(mp => mp.userId === req.user.id);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        userPlans = userPlans.filter(mp => {
          const d = new Date(mp.date);
          return d >= start && d <= end;
        });
      }

      userPlans.sort((a, b) => new Date(a.date) - new Date(b.date));
      return res.json({ success: true, data: userPlans });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/mealplans
// @desc    Add a meal to the planner
// @access  Private
router.post('/', protect, async (req, res) => {
  const { date, mealType, recipeId, recipeTitle, recipeImage, calories, protein, carbs, fat } = req.body;

  try {
    if (getIsConnected()) {
      const mealPlan = await MealPlan.create({
        userId: req.user._id,
        date: new Date(date),
        mealType,
        recipeId,
        recipeTitle,
        recipeImage,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0
      });

      return res.status(201).json({ success: true, data: mealPlan });
    } else {
      // Mock mode
      const newPlan = {
        _id: 'mp_' + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        date: new Date(date),
        mealType,
        recipeId,
        recipeTitle,
        recipeImage,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0
      };
      localMealPlans.push(newPlan);
      return res.status(201).json({ success: true, data: newPlan });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/mealplans/:id
// @desc    Delete a planned meal
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      const mealPlan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!mealPlan) {
        return res.status(404).json({ success: false, message: 'Meal plan entry not found' });
      }
      return res.json({ success: true, message: 'Meal removed from planner' });
    } else {
      // Mock mode
      const index = localMealPlans.findIndex(mp => mp._id === req.params.id && mp.userId === req.user.id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Meal plan entry not found' });
      }
      localMealPlans.splice(index, 1);
      return res.json({ success: true, message: 'Meal removed from planner' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/mealplans/suggestions
// @desc    Get automated meal suggestions based on current date (Real Recipes)
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const list = await searchMeals('c'); // Fetch dynamic common meals as suggestions!
    
    // Choose recipes for Breakfast, Lunch, and Dinner suggestions
    const breakfast = list[0] || null;
    const lunch = list[1] || null;
    const dinner = list[2] || null;

    return res.json({
      success: true,
      suggestions: {
        Breakfast: breakfast,
        Lunch: lunch,
        Dinner: dinner
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.localMealPlans = localMealPlans;
