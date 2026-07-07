import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlanner } from '../context/PlannerContext';
import { 
  Flame, Award, Sparkles, Plus, Calendar, 
  ShoppingBag, ArrowRight, TrendingUp, CheckCircle 
} from 'lucide-react';
import Loader from '../components/Loader';

const Home = () => {
  const { user, incrementStreak } = useAuth();
  const { mealPlans, shoppingList, notifications } = usePlanner();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [todayKcal, setTodayKcal] = useState(0);

  useEffect(() => {
    // Load recommendations/seasonal recipes
    fetch('/api/recipes?limit=25')
      .then(res => res.json())
      .then(d => {
        if (d.success) setRecipes(d.data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Calculate today's calories from scheduled meals
    const todayStr = new Date().toDateString();
    const todayMeals = mealPlans.filter(p => new Date(p.date).toDateString() === todayStr);
    const total = todayMeals.reduce((acc, p) => acc + p.calories, 0);
    setTodayKcal(total);
  }, [mealPlans]);

  const handleLogCooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await incrementStreak();
    if (res && res.success) {
      alert(`Great job! Streak incremented to ${res.streak} days. Keep it up!`);
    }
  };

  if (loading) return <Loader message="Plating your dashboard..." />;

  // Group recipes by tags/categories for custom sub-grids
  const highProtein = recipes.filter(r => r.protein >= 20 || r.dietTags.includes('High-Protein')).slice(0, 3);
  const lowCarb = recipes.filter(r => r.carbs <= 30 || r.dietTags.includes('Low-Carb')).slice(0, 3);
  const quickMeals = recipes.filter(r => r.cookingTime <= 20).slice(0, 3);

  return (
    <div className="flex flex-col gap-10 text-left">
      
      {/* 1. WELCOME HEADER */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 rounded-3xl text-white shadow-premium">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black">
            Welcome back, <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">{user ? user.name : 'Chef'}</span>!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {user ? "Let's review your goals, plan meals, and log today's culinary wins." : "Sign in to track macro targets, plan calendars, and unlock accomplishments!"}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleLogCooking}
            className="py-3 px-5 bg-gradient-premium hover:bg-brand-dark text-white rounded-2xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <CheckCircle className="w-4 h-4" /> Log Today's Cooking
          </button>
          <Link 
            to="/assistant" 
            className="py-3 px-5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-brand-light" /> Ask Chef Saga AI
          </Link>
        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak indicator */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Cooking Streak</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100">
              {user ? `${user.streak} Days` : '3 Days'}
            </h3>
            <p className="text-[11px] text-slate-400">Keep it lit! Burn matches daily.</p>
          </div>
          <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl">
            <Flame className="w-8 h-8 fill-orange-500 animate-pulse" />
          </div>
        </div>

        {/* Calories progress */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Today's Intake</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100">
              {todayKcal} / 2200 kcal
            </h3>
            <p className="text-[11px] text-slate-400">Scheduled plans calorie tally.</p>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        {/* Shopping list checklist count */}
        <div className="glass p-6 rounded-3xl flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Groceries Checklist</span>
            <h3 className="text-2xl font-display font-black text-slate-800 dark:text-slate-100">
              {shoppingList.items ? shoppingList.items.filter(i => !i.completed).length : 0} Items
            </h3>
            <p className="text-[11px] text-slate-400">Items left on your checklist.</p>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
        </div>

      </section>

      {/* Quick shortcuts banner */}
      <section className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 bg-gradient-to-r from-orange-500/5 to-emerald-500/5">
        <div className="flex flex-col gap-1">
          <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">Ingredient recommendation system</h4>
          <p className="text-slate-500 text-xs">Enter ingredients from your fridge, and our AI will suggest recipes!</p>
        </div>
        <Link 
          to="/recommend"
          className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
        >
          Try AI Recommendation <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* 3. HIGH PROTEIN DIET SECTION */}
      {highProtein.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">High Protein Plans</h2>
              <p className="text-slate-500 text-xs mt-0.5">Specially structured for muscle recovery and performance</p>
            </div>
            <Link to="/browse?diet=high-protein" className="text-brand text-xs font-bold hover:underline flex items-center gap-1">
              Browse High-Protein <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highProtein.map(recipe => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group glass-card rounded-2xl overflow-hidden flex gap-4 p-3 items-center"
              >
                <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-brand transition-colors">{recipe.title}</h4>
                  <span className="text-[11px] text-slate-500">{recipe.cuisine} • {recipe.protein}g protein</span>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-1">💪 Muscle Builder</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. LOW CARB DIET SECTION */}
      {lowCarb.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">Keto & Low Carb Selection</h2>
              <p className="text-slate-500 text-xs mt-0.5">Perfect for keto tracking and low carb preferences</p>
            </div>
            <Link to="/browse?diet=low-carb" className="text-brand text-xs font-bold hover:underline flex items-center gap-1">
              Browse Low-Carb <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lowCarb.map(recipe => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group glass-card rounded-2xl overflow-hidden flex gap-4 p-3 items-center"
              >
                <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-brand transition-colors">{recipe.title}</h4>
                  <span className="text-[11px] text-slate-500">{recipe.cuisine} • {recipe.carbs}g carbs</span>
                  <span className="text-[10px] text-orange-500 font-semibold mt-1">🥑 Low Carb</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. QUICK MEALS SECTION */}
      {quickMeals.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">Under 20 Minutes</h2>
              <p className="text-slate-500 text-xs mt-0.5">Express meals for busy schedules</p>
            </div>
            <Link to="/browse" className="text-brand text-xs font-bold hover:underline flex items-center gap-1">
              See all recipes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickMeals.map(recipe => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group glass-card rounded-2xl overflow-hidden flex gap-4 p-3 items-center"
              >
                <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-brand transition-colors">{recipe.title}</h4>
                  <span className="text-[11px] text-slate-500">{recipe.cuisine} • {recipe.cookingTime} mins</span>
                  <span className="text-[10px] text-blue-500 font-semibold mt-1">⏰ Quick & Easy</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
