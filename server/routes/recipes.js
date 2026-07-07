const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { mockRecipes, mockReviews, mockComments } = require('../utils/mockData');

// Local in-memory list for custom recipes created in demo mode
const customMockRecipes = [];

// Helper to filter local mock recipes
const filterMockRecipes = (query) => {
  let list = [...mockRecipes, ...customMockRecipes];
  const { search, category, cuisine, difficulty, diet, sort } = query;

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(r => 
      r.title.toLowerCase().includes(s) || 
      r.description.toLowerCase().includes(s) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(s))
    );
  }

  if (category) {
    list = list.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  if (cuisine) {
    list = list.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
  }

  if (difficulty) {
    list = list.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (diet) {
    list = list.filter(r => r.dietTags.some(t => t.toLowerCase() === diet.toLowerCase()));
  }

  if (sort) {
    if (sort === 'newest') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === 'popularity') {
      list.sort((a, b) => b.popularity - a.popularity);
    } else if (sort === 'cookingTime') {
      list.sort((a, b) => a.cookingTime - b.cookingTime);
    } else if (sort === 'calories') {
      list.sort((a, b) => a.calories - b.calories);
    }
  }

  return list;
};

// @route   GET /api/recipes
// @desc    Get all recipes with filters/search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, cuisine, difficulty, diet, sort, page = 1, limit = 10 } = req.query;

    if (getIsConnected()) {
      const queryObject = {};

      if (search) {
        queryObject.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'ingredients.name': { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        queryObject.category = { $regex: `^${category}$`, $options: 'i' };
      }

      if (cuisine) {
        queryObject.cuisine = { $regex: `^${cuisine}$`, $options: 'i' };
      }

      if (difficulty) {
        queryObject.difficulty = difficulty;
      }

      if (diet) {
        queryObject.dietTags = { $regex: `^${diet}$`, $options: 'i' };
      }

      let query = Recipe.find(queryObject);

      // Sorting
      if (sort) {
        if (sort === 'newest') query = query.sort('-createdAt');
        else if (sort === 'popularity') query = query.sort('-popularity');
        else if (sort === 'cookingTime') query = query.sort('cookingTime');
        else if (sort === 'calories') query = query.sort('calories');
      } else {
        query = query.sort('-popularity');
      }

      // Pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const total = await Recipe.countDocuments(queryObject);
      const recipes = await query.skip(skip).limit(limitNum);

      return res.json({
        success: true,
        count: recipes.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: recipes
      });
    } else {
      // Mock mode
      const filtered = filterMockRecipes(req.query);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const paginated = filtered.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total: filtered.length,
        page: pageNum,
        pages: Math.ceil(filtered.length / limitNum),
        data: paginated
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/recipes/trending
// @desc    Get top trending recipes
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    if (getIsConnected()) {
      const recipes = await Recipe.find({}).sort('-popularity').limit(5);
      return res.json({ success: true, data: recipes });
    } else {
      const sorted = [...mockRecipes, ...customMockRecipes].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
      return res.json({ success: true, data: sorted });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/recipes/recipe-of-the-day
// @desc    Get Recipe of the Day
// @access  Public
router.get('/recipe-of-the-day', async (req, res) => {
  try {
    if (getIsConnected()) {
      // Find one recipe (e.g. the first one or a random one)
      const count = await Recipe.countDocuments();
      const random = Math.floor(Math.random() * (count || 1));
      const recipe = await Recipe.findOne().skip(random);
      return res.json({ success: true, data: recipe || mockRecipes[0] });
    } else {
      // Return first mock recipe as recipe of the day
      return res.json({ success: true, data: mockRecipes[0] });
    }
  } catch (error) {
    res.status(500).json({ success: false, data: mockRecipes[0] });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe details with reviews and comments
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (getIsConnected()) {
      let recipe = await Recipe.findById(id);
      
      // If not found in DB but matches mock recipes (useful during DB migration)
      if (!recipe) {
        const mock = [...mockRecipes, ...customMockRecipes].find(r => r._id === id);
        if (mock) {
          const reviews = await Review.find({ recipeId: id });
          const comments = await Comment.find({ recipeId: id });
          return res.json({ success: true, data: { ...mock, reviews, comments } });
        }
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }

      const reviews = await Review.find({ recipeId: id });
      const comments = await Comment.find({ recipeId: id });

      return res.json({
        success: true,
        data: {
          ...recipe.toObject(),
          reviews,
          comments
        }
      });
    } else {
      // Mock mode
      const recipe = [...mockRecipes, ...customMockRecipes].find(r => r._id === id);
      if (!recipe) {
        return res.status(404).json({ success: false, message: 'Recipe not found (Demo Mode)' });
      }

      // Filter mock reviews/comments
      const reviews = mockReviews.filter(r => r.recipeId === id);
      const comments = mockComments.filter(c => c.recipeId === id);

      return res.json({
        success: true,
        data: {
          ...recipe,
          reviews,
          comments
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recipes
// @desc    Create a custom recipe
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, image, cookingTime, difficulty, calories, protein, carbs, fat, ingredients, instructions, category, cuisine, dietTags } = req.body;

  try {
    if (getIsConnected()) {
      const recipe = await Recipe.create({
        title,
        description,
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
        createdBy: req.user.id
      });

      return res.status(201).json({ success: true, data: recipe });
    } else {
      // Mock mode
      const newMock = {
        _id: 'custom_' + Math.random().toString(36).substr(2, 9),
        title,
        description,
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
// @desc    Add review to a recipe
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, reviewText } = req.body;
  const recipeId = req.params.id;

  try {
    if (getIsConnected()) {
      const review = await Review.create({
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        rating: parseInt(rating),
        reviewText
      });

      // Update recipe rating averages
      const reviews = await Review.find({ recipeId });
      const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      await Recipe.findByIdAndUpdate(recipeId, {
        averageRating: parseFloat(avg.toFixed(1)),
        reviewsCount: reviews.length
      });

      return res.status(201).json({ success: true, data: review });
    } else {
      // Mock mode
      const newReview = {
        _id: 'rev_' + Math.random().toString(36).substr(2, 9),
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        rating: parseInt(rating),
        reviewText,
        likes: 0,
        likedBy: [],
        createdAt: new Date()
      };
      mockReviews.push(newReview);

      // Update mock averages
      const targetRecipe = [...mockRecipes, ...customMockRecipes].find(r => r._id === recipeId);
      if (targetRecipe) {
        const recipeReviews = mockReviews.filter(r => r.recipeId === recipeId);
        const avg = recipeReviews.reduce((acc, item) => item.rating + acc, 0) / recipeReviews.length;
        targetRecipe.averageRating = parseFloat(avg.toFixed(1));
        targetRecipe.reviewsCount = recipeReviews.length;
      }

      return res.status(201).json({ success: true, data: newReview });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recipes/:id/comments
// @desc    Add comment to a recipe
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  const { commentText } = req.body;
  const recipeId = req.params.id;

  try {
    if (getIsConnected()) {
      const comment = await Comment.create({
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        commentText
      });
      return res.status(201).json({ success: true, data: comment });
    } else {
      // Mock mode
      const newComment = {
        _id: 'com_' + Math.random().toString(36).substr(2, 9),
        recipeId,
        userId: req.user.id,
        userName: req.user.name,
        userPicture: req.user.profilePicture || '',
        commentText,
        createdAt: new Date()
      };
      mockComments.push(newComment);
      return res.status(201).json({ success: true, data: newComment });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.customMockRecipes = customMockRecipes;
