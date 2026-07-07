import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Flame, Award, Clock, ArrowRight, Star, Heart, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [recipeOfTheDay, setRecipeOfTheDay] = useState(null);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    // Fetch recipe of the day and trending
    fetch('/api/recipes/recipe-of-the-day')
      .then(res => res.json())
      .then(d => { if (d.success) setRecipeOfTheDay(d.data); })
      .catch(e => console.error(e));

    fetch('/api/recipes/trending')
      .then(res => res.json())
      .then(d => { if (d.success) setTrending(d.data); })
      .catch(e => console.error(e));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const categories = [
    { name: 'Breakfast', emoji: '🍳', color: 'from-amber-400 to-orange-500' },
    { name: 'Pasta', emoji: '🍝', color: 'from-red-400 to-rose-600' },
    { name: 'Salad', emoji: '🥗', color: 'from-green-400 to-emerald-600' },
    { name: 'Curry', emoji: '🍛', color: 'from-yellow-400 to-amber-600' },
    { name: 'Seafood', emoji: '🐟', color: 'from-blue-400 to-indigo-600' }
  ];

  return (
    <div className="flex flex-col gap-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden py-16 md:py-24 px-6 md:px-12 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950 text-white flex flex-col md:flex-row items-center gap-12 shadow-premium">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 flex flex-col gap-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-light text-xs font-semibold self-start"
          >
            <Flame className="w-3.5 h-3.5 text-brand-light fill-brand-light" /> Real-Time Smart Gastronomy
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-display font-black leading-tight"
          >
            Where Culinary <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">Art</span> Meets AI Intelligence
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl"
          >
            Create meal calendars, track macro intakes automatically, generate smart shopping checklists, and consult Chef Saga, your custom interactive AI cooking bot.
          </motion.p>

          {/* Search bar */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl max-w-lg mt-2"
          >
            <Search className="w-5 h-5 text-slate-300 ml-2" />
            <input 
              type="text" 
              placeholder="Search recipes, cuisines, or ingredients..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent text-white placeholder-slate-400 text-sm w-full py-2 px-1 focus:outline-none"
            />
            <button 
              type="submit" 
              className="py-2.5 px-5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-premium transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              Search
            </button>
          </motion.form>
        </div>

        {/* Hero image stack */}
        <div className="flex-1 relative flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/10 shadow-premium"
          >
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" 
              alt="Premium Salad Bowl" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Micro floating items */}
          <div className="absolute top-10 left-10 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2 shadow-premium animate-bounce">
            <span className="text-xl">🥗</span>
            <div className="text-left text-[10px]">
              <p className="font-bold">Buddha Bowl</p>
              <p className="text-slate-300">450 kcal</p>
            </div>
          </div>
          
          <div className="absolute bottom-10 right-10 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center gap-2 shadow-premium animate-pulse">
            <span className="text-xl">🔥</span>
            <div className="text-left text-[10px]">
              <p className="font-bold">Meal Planner</p>
              <p className="text-slate-300">Target hit!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto w-full">
        {[
          { label: 'Verified Recipes', val: '5,000+' },
          { label: 'Active Chefs', val: '120k+' },
          { label: 'Weekly Meal Plans', val: '45k+' },
          { label: 'AI Cook queries/day', val: '98k+' }
        ].map((stat, i) => (
          <div key={i} className="p-6 glass rounded-2xl">
            <h3 className="text-3xl font-display font-black text-brand mb-1">{stat.val}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Explore Culinary Domains</h2>
            <p className="text-slate-500 text-sm mt-1">Browse and find recipes tailored for any occasion</p>
          </div>
          <Link to="/categories" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              to={`/browse?category=${cat.name}`}
              className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-3 group"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                {cat.emoji}
              </div>
              <span className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. RECIPE OF THE DAY */}
      {recipeOfTheDay && (
        <section className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-white/20">
          <div className="flex-1 rounded-2xl overflow-hidden aspect-[4/3] w-full max-h-80 shadow-md">
            <img src={recipeOfTheDay.image} alt={recipeOfTheDay.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col gap-4 text-left">
            <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider self-start">
              ⭐ Recipe of the Day
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-slate-100">{recipeOfTheDay.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{recipeOfTheDay.description}</p>
            <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {recipeOfTheDay.cookingTime} Mins</span>
              <span className="flex items-center gap-1"><Award className="w-4 h-4 text-slate-400" /> {recipeOfTheDay.difficulty}</span>
              <span className="flex items-center gap-1">🔥 {recipeOfTheDay.calories} kcal</span>
            </div>
            <Link 
              to={`/recipe/${recipeOfTheDay._id}`}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-sm shadow-md self-start flex items-center gap-2 hover:scale-105 active:scale-95 transition-all mt-2"
            >
              Start Cooking <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 5. TRENDING RECIPES */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Creations</h2>
            <p className="text-slate-500 text-sm mt-1">Highly-rated culinary pieces from our community</p>
          </div>
          <Link to="/browse?sort=popularity" className="text-brand font-semibold text-sm hover:underline flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trending.slice(0, 3).map(recipe => (
            <Link 
              key={recipe._id} 
              to={`/recipe/${recipe._id}`} 
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/20 text-brand">
                  <Heart className="w-4 h-4 fill-brand" />
                </div>
              </div>
              <div className="p-5 text-left flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{recipe.cuisine}</span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {recipe.averageRating || '4.5'}
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors truncate">{recipe.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">{recipe.description}</p>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                  <span>⏰ {recipe.cookingTime} Mins</span>
                  <span>🔥 {recipe.calories} kcal</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="flex flex-col gap-10 max-w-5xl mx-auto w-full text-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-slate-100">Loved by home chefs worldwide</h2>
          <p className="text-slate-500 text-sm mt-1">Here is what our members are cooking and saying</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Sarah Jenkins', role: 'Fitness enthusiast', quote: "The macro aggregator and BMI integration are game changers. It has structured my diet planning completely.", rating: 5, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
            { name: 'David Lee', role: 'Full-time Dad', quote: "My kids are picky eaters, but finding kid-friendly categories and creating automatic shopping lists saves me hours.", rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
            { name: 'Chef Robert', role: 'Professional Culinary Advisor', quote: "Chef Saga, the AI bot, gave me accurate substitutions for buttermilk. The local database engine fallback is exceptional.", rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
          ].map((t, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl flex flex-col gap-4 text-left justify-between">
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{t.name}</h4>
                  <p className="text-slate-400 text-[10px]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
