const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { searchMeals, getMealById, getMealsByCategory } = require('../utils/mealDB');

// In-memory list for custom recipes created in demo mode
const customMockRecipes = [];

// Helper to check if an ID is a MongoDB ObjectId
const isObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// @route   GET /api/recipes
// @desc    Get all recipes with filters/search (Integrated with TheMealDB)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, cuisine, difficulty, diet, sort, page = 1, limit = 9 } = req.query;
    let apiMeals = [];
    let customRecipes = [];

    // 1. Fetch from TheMealDB
    if (search) {
      apiMeals = await searchMeals(search);
    } else if (category) {
      apiMeals = await getMealsByCategory(category);
    } else {
      // Default initial query (empty search fallback to get initial listing)
      apiMeals = await searchMeals('c'); // 'c' yields common recipes
    }

    // 2. Fetch custom recipes from local DB (if connected)
    if (getIsConnected()) {
      const queryObject = { source: 'Custom' };
      if (search) {
        queryObject.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (category) {
        queryObject.category = { $regex: `^${category}$`, $options: 'i' };
      }
      if (cuisine) {
        queryObject.cuisine = { $regex: `^${cuisine}$`, $options: 'i' };
      }
      customRecipes = await Recipe.find(queryObject);
    } else {
      customRecipes = [...customMockRecipes];
      if (search) {
        const s = search.toLowerCase();
        customRecipes = customRecipes.filter(r => r.title.toLowerCase().includes(s));
      }
    }

    // 3. Combine results
    let combined = [...customRecipes, ...apiMeals];

    // 4. Apply filter tags locally on the combined list to ensure accuracy
    if (cuisine) {
      combined = combined.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
    }
    if (difficulty) {
      combined = combined.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (diet) {
      combined = combined.filter(r => r.dietTags.some(t => t.toLowerCase() === diet.toLowerCase()));
    }

    // 5. Apply sorting
    if (sort) {
      if (sort === 'newest') {
        // Mock date compare
        combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (sort === 'cookingTime') {
        combined.sort((a, b) => a.cookingTime - b.cookingTime);
      } else if (sort === 'calories') {
        combined.sort((a, b) => a.calories - b.calories);
      } else {
        // default popularity
        combined.sort((a, b) => b.popularity - a.popularity);
      }
    }

    // 6. Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const paginated = combined.slice(skip, skip + limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      total: combined.length,
      page: pageNum,
      pages: Math.ceil(combined.length / limitNum),
      data: paginated
    });
  } catch (error) {
    console.error('Fetch Recipes Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/recipes/trending
// @desc    Get top trending recipes
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const meals = await searchMeals('p'); // 'p' yields pasta/pizza items
    const sorted = meals.sort((a, b) => b.popularity - a.popularity).slice(0, 5);
    return res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/recipes/recipe-of-the-day
// @desc    Get Recipe of the Day
// @access  Public
router.get('/recipe-of-the-day', async (req, res) => {
  try {
    const meals = await searchMeals('b'); // common item
    const recipe = meals[0] || null;
    return res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe details from TheMealDB or local DB
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let recipe = null;

    if (isObjectId(id)) {
      // Fetch custom user recipe from MongoDB
      if (getIsConnected()) {
        recipe = await Recipe.findById(id);
      } else {
        recipe = customMockRecipes.find(r => r._id === id);
      }
    } else {
      // Fetch from TheMealDB
      recipe = await getMealById(id);
    }

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Retrieve comments & reviews from MongoDB if connected
    let reviews = [];
    let comments = [];
    if (getIsConnected()) {
      reviews = await Review.find({ recipeId: id });
      comments = await Comment.find({ recipeId: id });
    }

    const responseData = {
      ...(recipe.toObject ? recipe.toObject() : recipe),
      reviews,
      comments
    };

    return res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get Recipe Details Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recipes
// @desc    Create a custom recipe in MongoDB
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, image, cookingTime, difficulty, calories, protein, carbs, fat, ingredients, instructions, category, cuisine, dietTags } = req.body;

  try {
    if (getIsConnected()) {
      const recipe = await Recipe.create({
        title,
        description,
        source: 'Custom',
        image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
        cookingTime,
        difficulty,
        calories,
        protein,
        carbs,
        fat,
        ingredients,
        instructions,
        category,
        cuisine,
        dietTags,
        createdBy: req.user._id
      });
      return res.status(201).json({ success: true, data: recipe });
    } else {
      // Mock mode
      const newMock = {
        _id: 'custom_' + Math.random().toString(36).substr(2, 9),
        title,
        description,
        source: 'Custom',
        image: image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
        cookingTime: parseInt(cookingTime) || 20,
        difficulty: difficulty || 'Medium',
        calories: parseInt(calories) || 300,
        protein: parseInt(protein) || 10,
        carbs: parseInt(carbs) || 40,
        fat: parseInt(fat) || 10,
        ingredients: ingredients || [],
        instructions: instructions || [],
        category: category || 'Main Course',
        cuisine: cuisine || 'Global',
        dietTags: dietTags || [],
        createdBy: req.user.id,
        popularity: 10,
        createdAt: new Date()
      };
      customMockRecipes.push(newMock);
      return res.status(201).json({ success: true, data: newMock });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recipes/:id/reviews
// @desc    Add review in MongoDB
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, reviewText } = req.body;
  const recipeId = req.params.id;

  try {
    if (getIsConnected()) {
      const review = await Review.create({
        recipeId,
        userId: req.user._id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        rating: parseInt(rating),
        reviewText
      });
      return res.status(201).json({ success: true, data: review });
    } else {
      // Mock response
      const mockReview = {
        _id: 'rev_' + Math.random().toString(36).substr(2, 9),
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        rating: parseInt(rating),
        reviewText,
        createdAt: new Date()
      };
      return res.status(201).json({ success: true, data: mockReview });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recipes/:id/comments
// @desc    Add comment in MongoDB
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  const { commentText } = req.body;
  const recipeId = req.params.id;

  try {
    if (getIsConnected()) {
      const comment = await Comment.create({
        recipeId,
        userId: req.user._id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        commentText
      });
      return res.status(201).json({ success: true, data: comment });
    } else {
      const mockComment = {
        _id: 'com_' + Math.random().toString(36).substr(2, 9),
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        commentText,
        createdAt: new Date()
      };
      return res.status(201).json({ success: true, data: mockComment });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.customMockRecipes = customMockRecipes;
