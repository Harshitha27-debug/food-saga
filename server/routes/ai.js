const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { mockRecipes } = require('../utils/mockData');
const { getIsConnected } = require('../config/db');
const Recipe = require('../models/Recipe');

// Initialize Gemini API if key is available
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini AI Service:', error.message);
  }
}

// @route   POST /api/ai/recommend
// @desc    Generate recipe recommendations based on input ingredients and preferences
// @access  Public
router.post('/recommend', async (req, res) => {
  const {
    ingredients = [],
    mood = 'any',
    weather = 'any',
    timeOfDay = 'any',
    fitnessGoals = 'any',
    dietPreference = 'any',
    cookingSkill = 'Easy'
  } = req.body;

  if (ingredients.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide at least one ingredient' });
  }

  // 1. If Gemini API is available, generate custom response
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are "Chef Saga", a Michelin-star culinary AI. Recommend 3 delicious recipes using these ingredients: ${ingredients.join(', ')}.
        Take into account:
        - User's Mood: ${mood}
        - Weather conditions: ${weather}
        - Time of Day: ${timeOfDay}
        - Fitness Goals: ${fitnessGoals}
        - Dietary Preferences: ${dietPreference}
        - Cooking Skill Level: ${cookingSkill}
        
        Provide the response in raw JSON format matching this schema (do NOT surround it with markdown blocks or quote blocks, just output the JSON itself):
        {
          "recipes": [
            {
              "title": "Recipe Title",
              "description": "Short culinary summary",
              "cookingTime": 25,
              "difficulty": "Easy/Medium/Hard",
              "calories": 450,
              "protein": 20,
              "carbs": 50,
              "fat": 15,
              "ingredients": [
                {"name": "Ingredient 1", "amount": "100g"},
                {"name": "Ingredient 2", "amount": "2 tbsp"}
              ],
              "instructions": [
                {"step": 1, "text": "Step 1 description"},
                {"step": 2, "text": "Step 2 description"}
              ],
              "dietTags": ["Vegetarian", "Healthy"],
              "healthyAlternative": "Swap white rice for quinoa"
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean possible markdown JSON wrappers
      let cleanedText = text;
      if (text.startsWith('```json')) {
        cleanedText = text.substring(7, text.length - 3).trim();
      } else if (text.startsWith('```')) {
        cleanedText = text.substring(3, text.length - 3).trim();
      }

      const parsedJSON = JSON.parse(cleanedText);
      return res.json({ success: true, source: 'Gemini AI', data: parsedJSON.recipes });
    } catch (error) {
      console.error('Gemini API recommend error, falling back to local recommendation rules:', error.message);
    }
  }

  // 2. Local fallback rule-based system
  try {
    // Find mock/db recipes matching ingredients or preferences
    const dbRecipes = getIsConnected() ? await Recipe.find({}) : mockRecipes;
    
    // Simple relevance matcher
    const recommendations = dbRecipes.map(recipe => {
      let score = 0;
      // Match ingredients
      ingredients.forEach(ing => {
        if (recipe.ingredients.some(ri => ri.name.toLowerCase().includes(ing.toLowerCase()))) {
          score += 10;
        }
      });
      // Match diet
      if (dietPreference !== 'any' && recipe.dietTags.some(t => t.toLowerCase() === dietPreference.toLowerCase())) {
        score += 5;
      }
      // Match difficulty
      if (recipe.difficulty.toLowerCase() === cookingSkill.toLowerCase()) {
        score += 3;
      }
      return { recipe, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.recipe.toObject ? item.recipe.toObject() : item.recipe,
      healthyAlternative: item.recipe.dietTags.includes('Vegetarian') ? 'Replace butter with olive oil' : 'Use brown rice instead of white rice'
    }))
    .slice(0, 3);

    // If no matching recipe is found, construct a dynamic mock one using user's ingredients
    if (recommendations.length === 0) {
      const title = `${ingredients[0].charAt(0).toUpperCase() + ingredients[0].slice(1)} & Friends Stir-Fry`;
      recommendations.push({
        _id: 'ai_mock_1',
        title,
        description: `A delicious quick stir-fry combining your ingredients: ${ingredients.join(', ')}. Specially curated for your ${mood} mood.`,
        cookingTime: 15,
        difficulty: 'Easy',
        calories: 380,
        protein: 15,
        carbs: 45,
        fat: 12,
        ingredients: ingredients.map(ing => ({ name: ing, amount: '1 cup' })),
        instructions: [
          { step: 1, text: 'Heat 1 tbsp oil in a large skillet or wok over medium-high heat.' },
          { step: 2, text: `Add the sliced ingredients: ${ingredients.join(', ')}.` },
          { step: 3, text: 'Season with salt, pepper, soy sauce, and sauté for 8-10 minutes until tender.' }
        ],
        dietTags: [dietPreference !== 'any' ? dietPreference : 'Healthy'],
        healthyAlternative: 'Serve over cauliflower rice for a low-carb option.'
      });
    }

    return res.json({ success: true, source: 'Rule Engine Fallback', data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/ai/chat
// @desc    Culinary Chat Assistant
// @access  Public
router.post('/chat', async (req, res) => {
  const { message, chatHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  // 1. If Gemini API is available
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Build basic history context
      const formattedHistory = chatHistory.slice(-6).map(h => 
        `${h.sender === 'user' ? 'User' : 'Chef Saga'}: ${h.text}`
      ).join('\n');

      const systemPrompt = `You are "Chef Saga", a passionate, friendly, and expert culinary assistant. You help users with cooking tips, ingredient substitutes, recipe steps, and kitchen safety. Keep your answers brief, engaging, and professional.\n\nHistory:\n${formattedHistory}\n\nUser: ${message}\nChef Saga:`;

      const result = await model.generateContent(systemPrompt);
      return res.json({
        success: true,
        source: 'Gemini AI',
        reply: result.response.text().trim()
      });
    } catch (error) {
      console.error('Gemini Chat error, falling back to local cooking rules:', error.message);
    }
  }

  // 2. Rule Engine Fallback Cooking Chat
  const lowerMsg = message.toLowerCase();
  let reply = "I'm your Chef Saga assistant! That sounds interesting. Since I am in offline mode, could you ask me about 'substitutes', 'tips for steak', 'burn remedies', 'baking', or 'boiling eggs'?";

  if (lowerMsg.includes('substitute') || lowerMsg.includes('replace')) {
    reply = "As a chef, I recommend these popular substitutes:\n- Butter: Use olive oil (for cooking) or applesauce (for baking).\n- Eggs: Use applesauce, mashed banana, or chia seeds soaked in water.\n- Milk: Almond, soy, or oat milk work beautifully.\n- Soy Sauce: Coconut aminos or tamari are excellent gluten-free alternatives.";
  } else if (lowerMsg.includes('egg') || lowerMsg.includes('boil')) {
    reply = "To boil the perfect eggs, place them in boiling water for:\n- Soft-boiled: 6 minutes (runny yolk, firm white)\n- Medium-boiled: 8 minutes (creamy yolk)\n- Hard-boiled: 10 minutes (fully set yolk)\nPro-tip: Plunge them into an ice bath immediately after to make peeling effortless!";
  } else if (lowerMsg.includes('burn') || lowerMsg.includes('heat') || lowerMsg.includes('pan')) {
    reply = "Kitchen safety is key! If you burn yourself, immediately run cold water over the area for 10-15 minutes. Never apply butter or ice directly. If it is severe, seek medical help. For a hot pan, sprinkle a bit of water: if it dances and evaporates in small beads, your pan is preheated!";
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    reply = "Hello there! I'm Chef Saga, your AI kitchen assistant. What cooking adventure are we embarking on today? Let me know if you need help with a recipe, ingredient swap, or general kitchen advice!";
  } else if (lowerMsg.includes('thank') || lowerMsg.includes('thanks')) {
    reply = "You're very welcome! Happy cooking! Let me know if there's anything else I can assist you with in the kitchen.";
  }

  return res.json({
    success: true,
    source: 'Chef Saga Bot (Fallback)',
    reply
  });
});

module.exports = router;
