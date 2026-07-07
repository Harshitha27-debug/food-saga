// Service to query TheMealDB API and map it to our unified Recipe schema

const mapMealToRecipe = (meal) => {
  if (!meal) return null;

  // Extract ingredients and measurements
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingName = meal[`strIngredient${i}`];
    const ingMeasure = meal[`strMeasure${i}`];
    if (ingName && ingName.trim()) {
      ingredients.push({
        name: ingName.trim(),
        amount: ingMeasure ? ingMeasure.trim() : 'to taste'
      });
    }
  }

  // Parse instructions into steps
  let instructions = [];
  if (meal.strInstructions) {
    const rawSteps = meal.strInstructions
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    if (rawSteps.length > 0) {
      instructions = rawSteps.map((stepText, idx) => ({
        step: idx + 1,
        // Remove step prefixes if present (e.g. "1. Heat oil" -> "Heat oil")
        text: stepText.replace(/^\d+[\.\-\s]*/, '')
      }));
    } else {
      instructions = [{ step: 1, text: meal.strInstructions }];
    }
  }

  // Parse YouTube video URL to embed URL
  let videoUrl = '';
  if (meal.strYoutube) {
    const ytMatch = meal.strYoutube.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    if (ytMatch && ytMatch[1]) {
      videoUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
  }

  // Parse tags
  const tags = meal.strTags ? meal.strTags.split(',').map(t => t.trim()) : [];
  
  // Diet tags assignment
  const dietTags = [];
  const category = meal.strCategory || '';
  const lowerCat = category.toLowerCase();
  
  if (lowerCat.includes('vegetarian') || lowerCat.includes('salad') || lowerCat.includes('side')) {
    dietTags.push('Vegetarian');
  }
  if (lowerCat.includes('vegan')) {
    dietTags.push('Vegetarian');
    dietTags.push('Vegan');
  }
  if (lowerCat.includes('dessert') || lowerCat.includes('pasta')) {
    // defaults
  } else {
    // Add healthy tag for low calorie foods
  }

  // Deterministic nutrition generator based on meal ID to keep it consistent
  const idNum = parseInt(meal.idMeal) || 100;
  const calories = 250 + (idNum % 450); // 250 - 700 kcal
  let protein = 8 + (idNum % 32); // 8 - 40g
  let carbs = 15 + (idNum % 65); // 15 - 80g
  let fat = 5 + (idNum % 25); // 5 - 30g

  if (lowerCat.includes('beef') || lowerCat.includes('chicken') || lowerCat.includes('pork') || lowerCat.includes('seafood')) {
    protein = Math.max(protein, 24);
    dietTags.push('High-Protein');
  } else if (lowerCat.includes('vegetarian') || lowerCat.includes('vegan') || lowerCat.includes('salad')) {
    protein = Math.min(protein, 14);
    fat = Math.min(fat, 12);
    dietTags.push('Healthy');
  }

  if (carbs <= 25) {
    dietTags.push('Low-Carb');
  }

  const cookingTime = 10 + (idNum % 50); // 10 - 60 mins
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const difficulty = difficulties[idNum % 3];

  return {
    _id: meal.idMeal,
    title: meal.strMeal,
    description: `A delicious ${meal.strArea || 'Global'} style ${category.toLowerCase()} dish. Perfect for family dinner.`,
    source: 'TheMealDB',
    sourceId: meal.idMeal,
    image: meal.strMealThumb || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
    gallery: [meal.strMealThumb],
    cookingTime,
    difficulty,
    calories,
    protein,
    carbs,
    fat,
    ingredients,
    instructions,
    videoUrl,
    category,
    cuisine: meal.strArea || 'Global',
    dietTags,
    popularity: 50 + (idNum % 50), // 50 - 100 rating popularity
    averageRating: parseFloat((4.0 + (idNum % 10) / 10).toFixed(1)), // 4.0 - 5.0 rating
    reviewsCount: 5 + (idNum % 25)
  };
};

const searchMeals = async (query) => {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query || '')}`);
    const data = await res.json();
    if (data.meals) {
      return data.meals.map(mapMealToRecipe);
    }
    return [];
  } catch (error) {
    console.error('TheMealDB Search Error:', error.message);
    return [];
  }
};

const getMealById = async (id) => {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    if (data.meals && data.meals[0]) {
      return mapMealToRecipe(data.meals[0]);
    }
    return null;
  } catch (error) {
    console.error('TheMealDB Lookup Error:', error.message);
    return null;
  }
};

const getMealsByCategory = async (category) => {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
    const data = await res.json();
    if (data.meals) {
      // The filter endpoint only returns idMeal, strMeal, strMealThumb.
      // To return full recipes, we map the minimal info or fetch details (limit to first 6 to prevent timeouts).
      const fullMeals = await Promise.all(
        data.meals.slice(0, 6).map(m => getMealById(m.idMeal))
      );
      return fullMeals.filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('TheMealDB Category Error:', error.message);
    return [];
  }
};

module.exports = {
  searchMeals,
  getMealById,
  getMealsByCategory
};
