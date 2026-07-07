const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');
const Recipe = require('../models/Recipe');
const { getIsConnected } = require('../config/db');
const { protect } = require('../middleware/auth');
const { getMealById } = require('../utils/mealDB');

// Local mock storage for demo mode
let localShoppingList = { items: [] };

// Helper to check if an ID is a MongoDB ObjectId
const isObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper to find a recipe details (mock, db, or TheMealDB)
const findRecipe = async (id) => {
  if (isObjectId(id)) {
    if (getIsConnected()) {
      return await Recipe.findById(id);
    }
    return null;
  } else {
    return await getMealById(id);
  }
};

// @route   GET /api/shoppinglist
// @desc    Get user shopping list
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (getIsConnected()) {
      let list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) {
        list = await ShoppingList.create({ userId: req.user._id, items: [] });
      }
      return res.json({ success: true, data: list });
    } else {
      return res.json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/shoppinglist
// @desc    Add item manually
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, amount } = req.body;

  try {
    if (getIsConnected()) {
      let list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) {
        list = new ShoppingList({ userId: req.user._id, items: [] });
      }

      list.items.push({ name, amount, completed: false });
      await list.save();

      return res.status(201).json({ success: true, data: list });
    } else {
      // Mock mode
      const newItem = {
        _id: 'item_' + Math.random().toString(36).substr(2, 9),
        name,
        amount,
        completed: false,
        recipeId: null
      };
      localShoppingList.items.push(newItem);
      return res.status(201).json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/shoppinglist/item/:itemId
// @desc    Update/Toggle a shopping list item completion state or amount
// @access  Private
router.put('/item/:itemId', protect, async (req, res) => {
  const { completed, amount, name } = req.body;
  const itemId = req.params.itemId;

  try {
    if (getIsConnected()) {
      const list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) return res.status(404).json({ success: false, message: 'Shopping list not found' });

      const item = list.items.id(itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

      if (completed !== undefined) item.completed = completed;
      if (amount !== undefined) item.amount = amount;
      if (name !== undefined) item.name = name;

      await list.save();
      return res.json({ success: true, data: list });
    } else {
      // Mock mode
      const item = localShoppingList.items.find(i => i._id === itemId || i.name === itemId);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found in Demo' });

      if (completed !== undefined) item.completed = completed;
      if (amount !== undefined) item.amount = amount;
      if (name !== undefined) item.name = name;

      return res.json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/shoppinglist/item/:itemId
// @desc    Delete a single shopping list item
// @access  Private
router.delete('/item/:itemId', protect, async (req, res) => {
  const itemId = req.params.itemId;

  try {
    if (getIsConnected()) {
      const list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) return res.status(404).json({ success: false, message: 'Shopping list not found' });

      list.items = list.items.filter(i => i._id.toString() !== itemId);
      await list.save();
      return res.json({ success: true, data: list });
    } else {
      localShoppingList.items = localShoppingList.items.filter(i => i._id !== itemId && i.name !== itemId);
      return res.json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/shoppinglist
// @desc    Clear list or clear completed items
// @access  Private
router.delete('/', protect, async (req, res) => {
  const { clearCompleted } = req.query;

  try {
    if (getIsConnected()) {
      const list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) return res.status(404).json({ success: false, message: 'Shopping list not found' });

      if (clearCompleted === 'true') {
        list.items = list.items.filter(i => !i.completed);
      } else {
        list.items = [];
      }

      await list.save();
      return res.json({ success: true, data: list });
    } else {
      // Mock mode
      if (clearCompleted === 'true') {
        localShoppingList.items = localShoppingList.items.filter(i => !i.completed);
      } else {
        localShoppingList.items = { items: [] };
      }
      return res.json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/shoppinglist/generate
// @desc    Automatically pull ingredients from multiple recipes and merge into shopping list
// @access  Private
router.post('/generate', protect, async (req, res) => {
  const { recipeIds } = req.body; // Array of recipe IDs

  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide recipe IDs' });
  }

  try {
    const ingredientsToAdd = [];

    for (const rId of recipeIds) {
      const recipe = await findRecipe(rId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          ingredientsToAdd.push({
            name: ing.name,
            amount: ing.amount,
            recipeId: rId
          });
        });
      }
    }

    if (getIsConnected()) {
      let list = await ShoppingList.findOne({ userId: req.user._id });
      if (!list) {
        list = new ShoppingList({ userId: req.user._id, items: [] });
      }

      // Add & merge items
      ingredientsToAdd.forEach(newItem => {
        const existing = list.items.find(i => i.name.toLowerCase() === newItem.name.toLowerCase() && !i.completed);
        if (existing) {
          existing.amount = `${existing.amount} + ${newItem.amount}`;
        } else {
          list.items.push({
            name: newItem.name,
            amount: newItem.amount,
            completed: false,
            recipeId: newItem.recipeId
          });
        }
      });

      await list.save();
      return res.status(201).json({ success: true, data: list });
    } else {
      // Mock mode
      ingredientsToAdd.forEach(newItem => {
        const existing = localShoppingList.items.find(i => i.name.toLowerCase() === newItem.name.toLowerCase() && !i.completed);
        if (existing) {
          existing.amount = `${existing.amount} + ${newItem.amount}`;
        } else {
          localShoppingList.items.push({
            _id: 'item_' + Math.random().toString(36).substr(2, 9),
            name: newItem.name,
            amount: newItem.amount,
            completed: false,
            recipeId: newItem.recipeId
          });
        }
      });

      return res.status(201).json({ success: true, data: localShoppingList });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
