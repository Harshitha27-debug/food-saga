// Mock data for fallback mode when database is not connected

const mockRecipes = [
  {
    _id: "rec_1",
    title: "Classic Spaghetti Carbonara",
    description: "An elegant Roman pasta dish made with eggs, hard cheese, cured pork, and black pepper. Simple, creamy, and satisfying.",
    source: "Custom",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80"
    ],
    cookingTime: 25,
    difficulty: "Medium",
    calories: 650,
    protein: 28,
    carbs: 75,
    fat: 26,
    ingredients: [
      { name: "Spaghetti", amount: "400g" },
      { name: "Pancetta or Guanciale", amount: "150g" },
      { name: "Egg Yolks", amount: "4 large" },
      { name: "Pecorino Romano", amount: "50g" },
      { name: "Black Pepper", amount: "2 tsp" },
      { name: "Garlic", amount: "2 cloves" }
    ],
    instructions: [
      { step: 1, text: "Bring a large pot of salted water to a boil and cook spaghetti according to package directions." },
      { step: 2, text: "While pasta cooks, cook diced guanciale/pancetta with garlic cloves in a skillet until crispy. Remove garlic." },
      { step: 3, text: "In a bowl, whisk egg yolks and Pecorino Romano cheese with plenty of freshly cracked black pepper." },
      { step: 4, text: "Drain pasta, reserving 1 cup of pasta water. Toss pasta into the skillet with warm fat and meat." },
      { step: 5, text: "Remove from heat, let cool slightly, then pour in the egg-cheese mixture. Add reserved pasta water as needed to create a glossy, creamy sauce." }
    ],
    videoUrl: "https://www.youtube.com/embed/3AAdKl1UYZs",
    reviewsCount: 15,
    averageRating: 4.8,
    category: "Pasta",
    cuisine: "Italian",
    dietTags: ["High-Protein"],
    popularity: 95,
    createdAt: new Date("2026-01-01")
  },
  {
    _id: "rec_2",
    title: "Avocado Toast with Poached Egg",
    description: "Crispy sourdough bread topped with mashed avocado, chili flakes, sea salt, and a perfectly runny poached egg.",
    source: "Custom",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
    ],
    cookingTime: 10,
    difficulty: "Easy",
    calories: 320,
    protein: 14,
    carbs: 22,
    fat: 18,
    ingredients: [
      { name: "Sourdough Bread", amount: "2 slices" },
      { name: "Ripe Avocado", amount: "1 whole" },
      { name: "Eggs", amount: "2 large" },
      { name: "Lemon Juice", amount: "1 tsp" },
      { name: "Red Chili Flakes", amount: "1/2 tsp" },
      { name: "Salt and Pepper", amount: "to taste" }
    ],
    instructions: [
      { step: 1, text: "Toast sourdough bread to your desired crispiness." },
      { step: 2, text: "Mash avocado with lemon juice, salt, and pepper in a small bowl." },
      { step: 3, text: "Poach the eggs in gently simmering water with a splash of vinegar for 3-4 minutes." },
      { step: 4, text: "Spread avocado mash on toast, top with poached eggs, and sprinkle red chili flakes." }
    ],
    videoUrl: "",
    reviewsCount: 8,
    averageRating: 4.5,
    category: "Breakfast",
    cuisine: "American",
    dietTags: ["Vegetarian", "Healthy"],
    popularity: 88,
    createdAt: new Date("2026-01-05")
  },
  {
    _id: "rec_3",
    title: "Vegetarian Buddha Bowl",
    description: "A nourishing grain bowl packed with roasted sweet potatoes, crispy chickpeas, fresh kale, quinoa, and a creamy tahini dressing.",
    source: "Custom",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
    ],
    cookingTime: 35,
    difficulty: "Easy",
    calories: 450,
    protein: 16,
    carbs: 60,
    fat: 14,
    ingredients: [
      { name: "Quinoa", amount: "1 cup cooked" },
      { name: "Sweet Potato", amount: "1 medium, cubed" },
      { name: "Canned Chickpeas", amount: "1 cup, rinsed" },
      { name: "Kale", amount: "2 cups, chopped" },
      { name: "Tahini", amount: "2 tbsp" },
      { name: "Olive Oil", amount: "2 tbsp" },
      { name: "Garlic Powder", amount: "1 tsp" }
    ],
    instructions: [
      { step: 1, text: "Preheat oven to 400°F (200°C)." },
      { step: 2, text: "Toss sweet potato cubes and chickpeas in olive oil, garlic powder, salt, and roast for 25 minutes." },
      { step: 3, text: "Steam kale lightly or massage with a splash of olive oil." },
      { step: 4, text: "Whisk tahini with lemon juice and warm water until smooth." },
      { step: 5, text: "Assemble bowls with a base of quinoa, topped with roasted sweet potatoes, chickpeas, kale, and drizzle with tahini dressing." }
    ],
    videoUrl: "",
    reviewsCount: 22,
    averageRating: 4.9,
    category: "Salad",
    cuisine: "Mediterranean",
    dietTags: ["Vegetarian", "Vegan", "Gluten-Free", "Healthy"],
    popularity: 98,
    createdAt: new Date("2026-02-10")
  },
  {
    _id: "rec_4",
    title: "Paneer Tikka Masala",
    description: "Grilled Indian paneer cheese cubes served in a rich, creamy, spiced tomato-onion curry sauce. Perfect with garlic naan.",
    source: "Custom",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
    ],
    cookingTime: 40,
    difficulty: "Hard",
    calories: 520,
    protein: 22,
    carbs: 18,
    fat: 38,
    ingredients: [
      { name: "Paneer", amount: "300g, cubed" },
      { name: "Yogurt", amount: "1/2 cup" },
      { name: "Canned Tomato Puree", amount: "1.5 cups" },
      { name: "Heavy Cream", amount: "1/4 cup" },
      { name: "Ginger-Garlic Paste", amount: "1 tbsp" },
      { name: "Garam Masala", amount: "2 tsp" },
      { name: "Butter", amount: "2 tbsp" }
    ],
    instructions: [
      { step: 1, text: "Marinate paneer cubes in yogurt, ginger-garlic paste, chili powder, and garam masala for 30 minutes." },
      { step: 2, text: "Grill or pan-fry paneer cubes until golden brown on all sides." },
      { step: 3, text: "Sauté onions, ginger, garlic in butter. Add spices and tomato puree; simmer for 15 minutes." },
      { step: 4, text: "Stir in heavy cream, add the grilled paneer, and simmer for another 5 minutes. Garnish with cilantro." }
    ],
    videoUrl: "",
    reviewsCount: 30,
    averageRating: 4.7,
    category: "Curry",
    cuisine: "Indian",
    dietTags: ["Vegetarian", "Gluten-Free"],
    popularity: 96,
    createdAt: new Date("2026-03-01")
  },
  {
    _id: "rec_5",
    title: "Grilled Salmon with Asparagus",
    description: "Tender, flaky grilled salmon fillet seasoned with lemon herb butter and served with snap-crisp asparagus spears.",
    source: "Custom",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
    ],
    cookingTime: 20,
    difficulty: "Medium",
    calories: 420,
    protein: 36,
    carbs: 8,
    fat: 28,
    ingredients: [
      { name: "Salmon Fillet", amount: "200g" },
      { name: "Asparagus", amount: "1 bunch" },
      { name: "Butter", amount: "1 tbsp" },
      { name: "Lemon", amount: "1 whole" },
      { name: "Fresh Dill", amount: "1 tbsp" },
      { name: "Olive Oil", amount: "1 tbsp" }
    ],
    instructions: [
      { step: 1, text: "Brush salmon and asparagus with olive oil, salt, and pepper." },
      { step: 2, text: "Grill salmon skin-side down for 5-6 minutes, then flip and grill for another 4 minutes." },
      { step: 3, text: "Grill asparagus alongside the salmon for 5-7 minutes until slightly charred." },
      { step: 4, text: "Whisk melted butter, lemon juice, and chopped dill, then drizzle over the salmon before serving." }
    ],
    videoUrl: "",
    reviewsCount: 18,
    averageRating: 4.6,
    category: "Seafood",
    cuisine: "French",
    dietTags: ["Gluten-Free", "Low-Carb", "High-Protein", "Healthy"],
    popularity: 92,
    createdAt: new Date("2026-03-15")
  }
];

const mockReviews = [
  {
    _id: "rev_1",
    recipeId: "rec_1",
    userId: "mock_user_1",
    userName: "Gordon R.",
    userPicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    reviewText: "Finally! A recipe that doesn't use heavy cream for Carbonara. Authentic, creamy, and gorgeous. 5/5 stars!",
    likes: 42,
    likedBy: [],
    createdAt: new Date()
  },
  {
    _id: "rev_2",
    recipeId: "rec_1",
    userId: "mock_user_2",
    userName: "Alice Smith",
    userPicture: "",
    rating: 4,
    reviewText: "Tasted delicious! I couldn't find guanciale, so I used bacon instead, and it worked out fine. The cheese yolk sauce is incredible.",
    likes: 8,
    likedBy: [],
    createdAt: new Date()
  }
];

const mockComments = [
  {
    _id: "com_1",
    recipeId: "rec_1",
    userId: "mock_user_3",
    userName: "Chef Jamie",
    userPicture: "",
    commentText: "Tip: Make sure you let the skillet cool slightly before pouring the egg mix, or you'll get scrambled eggs!",
    createdAt: new Date()
  }
];

const mockMealPlans = [
  {
    _id: "mp_1",
    userId: "mock_user_1",
    date: new Date(),
    mealType: "Breakfast",
    recipeId: "rec_2",
    recipeTitle: "Avocado Toast with Poached Egg",
    recipeImage: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    calories: 320,
    protein: 14,
    carbs: 22,
    fat: 18
  },
  {
    _id: "mp_2",
    userId: "mock_user_1",
    date: new Date(),
    mealType: "Lunch",
    recipeId: "rec_3",
    recipeTitle: "Vegetarian Buddha Bowl",
    recipeImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    calories: 450,
    protein: 16,
    carbs: 60,
    fat: 14
  }
];

const mockShoppingLists = {
  items: [
    { name: "Avocado", amount: "2", completed: false, recipeId: "rec_2" },
    { name: "Eggs", amount: "6", completed: true, recipeId: "rec_2" },
    { name: "Sourdough bread", amount: "1 loaf", completed: false, recipeId: "rec_2" },
    { name: "Sweet Potato", amount: "2", completed: false, recipeId: "rec_3" },
    { name: "Tahini", amount: "1 jar", completed: false, recipeId: "rec_3" }
  ]
};

const mockNotifications = [
  {
    _id: "not_1",
    userId: "mock_user_1",
    title: "Streak Update!",
    message: "Congratulations! You've maintained a 5-day cooking streak. Keep it up!",
    type: "streak",
    isRead: false,
    createdAt: new Date()
  },
  {
    _id: "not_2",
    userId: "mock_user_1",
    title: "New Achievement!",
    message: "You've unlocked the badge 'Healthy Chef' for cooking 3 vegetarian meals.",
    type: "achievement",
    isRead: false,
    createdAt: new Date()
  }
];

module.exports = {
  mockRecipes,
  mockReviews,
  mockComments,
  mockMealPlans,
  mockShoppingLists,
  mockNotifications
};
