const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a recipe title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  source: {
    type: String,
    enum: ['TheMealDB', 'Spoonacular', 'Custom'],
    default: 'Custom'
  },
  sourceId: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  gallery: {
    type: [String],
    default: []
  },
  cookingTime: {
    type: Number,
    required: [true, 'Please add cooking time in minutes']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
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
  },
  ingredients: [
    {
      name: { type: String, required: true },
      amount: { type: String, required: true }
    }
  ],
  instructions: [
    {
      step: { type: Number },
      text: { type: String, required: true }
    }
  ],
  videoUrl: {
    type: String,
    default: ''
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  cuisine: {
    type: String,
    required: [true, 'Please add a cuisine type']
  },
  dietTags: {
    type: [String],
    default: [] // Vegetarian, Vegan, Gluten-Free, Low-Carb, High-Protein
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', RecipeSchema);
