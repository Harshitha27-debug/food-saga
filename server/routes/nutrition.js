const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { localMealPlans } = require('./mealplans');

// In-memory water log for users in demo mode
const waterTracker = {};

// @route   GET /api/nutrition
// @desc    Get macro progress and average aggregates for weekly/monthly analytics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let plans = [];

    if (getIsConnected()) {
      plans = await MealPlan.find({ userId: req.user.id });
    } else {
      plans = localMealPlans.filter(p => p.userId === req.user.id);
    }

    // Aggregate stats by date (last 7 days)
    const weeklyData = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - idx);
      const dateStr = date.toDateString();

      // Find plans for this date
      const daysPlans = plans.filter(p => new Date(p.date).toDateString() === dateStr);

      const calories = daysPlans.reduce((acc, p) => acc + p.calories, 0);
      const protein = daysPlans.reduce((acc, p) => acc + p.protein, 0);
      const carbs = daysPlans.reduce((acc, p) => acc + p.carbs, 0);
      const fat = daysPlans.reduce((acc, p) => acc + p.fat, 0);

      return {
        date: date.toLocaleDateString(undefined, { weekday: 'short' }),
        calories,
        protein,
        carbs,
        fat
      };
    }).reverse();

    // Default daily targets
    const targets = {
      calories: 2200,
      protein: 130,
      carbs: 250,
      fat: 70
    };

    // Calculate today's totals
    const todayStr = new Date().toDateString();
    const todayPlans = plans.filter(p => new Date(p.date).toDateString() === todayStr);

    const todayTotals = {
      calories: todayPlans.reduce((acc, p) => acc + p.calories, 0),
      protein: todayPlans.reduce((acc, p) => acc + p.protein, 0),
      carbs: todayPlans.reduce((acc, p) => acc + p.carbs, 0),
      fat: todayPlans.reduce((acc, p) => acc + p.fat, 0)
    };

    // Retrieve water intake
    const waterKey = `${req.user.id}_${todayStr}`;
    const waterCups = waterTracker[waterKey] || 0;

    return res.json({
      success: true,
      data: {
        targets,
        todayTotals,
        weeklyData,
        waterCups
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/nutrition/water
// @desc    Increment water intake for today
// @access  Private
router.post('/water', protect, async (req, res) => {
  const { amount = 1 } = req.body; // cups of water

  try {
    const todayStr = new Date().toDateString();
    const waterKey = `${req.user.id}_${todayStr}`;

    waterTracker[waterKey] = (waterTracker[waterKey] || 0) + amount;

    return res.json({
      success: true,
      waterCups: waterTracker[waterKey],
      message: 'Water logged successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/nutrition/bmi
// @desc    Calculate BMI metrics
// @access  Public
router.post('/bmi', (req, res) => {
  const { weight, height } = req.body; // weight in kg, height in cm

  if (!weight || !height) {
    return res.status(400).json({ success: false, message: 'Please provide height and weight' });
  }

  try {
    const heightInMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    let status = 'Normal weight';
    let color = 'emerald';
    if (bmiValue < 18.5) {
      status = 'Underweight';
      color = 'amber';
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      status = 'Overweight';
      color = 'orange';
    } else if (bmiValue >= 30) {
      status = 'Obese';
      color = 'red';
    }

    return res.json({
      success: true,
      bmi: bmiValue,
      status,
      color,
      range: '18.5 - 24.9'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
