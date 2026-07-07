const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    required: true
  },
  recipeId: {
    type: String,
    required: true
  },
  recipeTitle: {
    type: String,
    required: true
  },
  recipeImage: {
    type: String,
    default: ''
  },
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
