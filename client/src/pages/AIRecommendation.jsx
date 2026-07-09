import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Plus, X, ArrowRight, Flame, 
  Clock, Heart, ShieldAlert, BadgeAlert 
} from 'lucide-react';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || '';

const AIRecommendation = () => {
  const { token } = useAuth();
  
  // Ingredients list tags
  const [ingredients, setIngredients] = useState(['Rice', 'Tomato', 'Onion']);
  const [inputValue, setInputValue] = useState('');

  // Preference states
  const [mood, setMood] = useState('any');
  const [weather, setWeather] = useState('any');
  const [timeOfDay, setTimeOfDay] = useState('any');
  const [fitnessGoals, setFitnessGoals] = useState('any');
  const [dietPreference, setDietPreference] = useState('any');
  const [cookingSkill, setCookingSkill] = useState('Easy');

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      alert('Please add at least one ingredient.');
      return;
    }

    setLoading(true);
    setRecommendations(null);

    const payload = {
      ingredients,
      mood,
      weather,
      timeOfDay,
      fitnessGoals,
      dietPreference,
      cookingSkill
    };

    try {
      const res = await fetch(`${API_URL}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations({
          source: data.source,
          recipes: data.data
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moods = ['Cozy', 'Refreshed', 'Adventurous', 'Stressed', 'Energized', 'any'];
  const weathers = ['Warm', 'Rainy', 'Cold', 'Humid', 'any'];
  const times = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'any'];
  const goals = ['Weight Loss', 'Muscle Gain', 'Healthy Lifestyle', 'Keto', 'any'];
  const diets = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein', 'any'];

  return (
    <div className="flex flex-col gap-10 text-left">
      
      {/* HEADER SECTION */}
      <section>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-brand" /> Smart Recipe Creator
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Let Chef Saga analyze what is in your kitchen and curate customized recipes.</p>
      </section>

      {/* INPUT FORM SHEET */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Ingredients tag-input compiler */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">1. Fridge Ingredients</h3>
          
          <form onSubmit={handleAddIngredient} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Potato, egg..." 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
            />
            <button 
              type="submit" 
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Add
            </button>
          </form>

          {/* Tags list */}
          <div className="flex flex-wrap gap-2 min-h-24 py-1">
            {ingredients.map(ing => (
              <span 
                key={ing} 
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand/5 border border-brand/10 text-xs font-semibold text-brand"
              >
                {ing}
                <button onClick={() => handleRemoveIngredient(ing)} className="hover:scale-110 ml-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {ingredients.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-6 w-full italic">No ingredients entered yet.</p>
            )}
          </div>
        </div>

        {/* Preference drop-down selectors */}
        <div className="md:col-span-2 glass p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-slate-200/50 justify-between">
          <h3 className="font-display font-bold text-base text-slate-850 dark:text-slate-100 sm:col-span-2 md:col-span-3">2. Preferences & Setting</h3>

          {/* Mood */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Mood</label>
            <select value={mood} onChange={e => setMood(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {moods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Weather */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outside Weather</label>
            <select value={weather} onChange={e => setWeather(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {weathers.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          {/* Time of day */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time of Day</label>
            <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Goals */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fitness Goals</label>
            <select value={fitnessGoals} onChange={e => setFitnessGoals(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {goals.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Diets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dietary restriction</label>
            <select value={dietPreference} onChange={e => setDietPreference(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {diets.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Skill */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cooking Skill</label>
            <select value={cookingSkill} onChange={e => setCookingSkill(e.target.value)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 justify-center sm:col-span-2 md:col-span-3 mt-4"
          >
            <Sparkles className="w-4 h-4 text-white" /> Query Chef Saga suggestions
          </button>
        </div>

      </section>

      {/* RESULTS DISPLAY GRID */}
      {loading && <Loader message="Chef Saga is analyzing ingredient profiles..." />}

      {recommendations && (
        <section className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-display font-bold">Recommended Meals</h2>
            <span className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase rounded-lg">
              Engine: {recommendations.source}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.recipes.map((recipe, idx) => (
              <div 
                key={idx}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-sm"
              >
                {recipe.image && (
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                
                <div className="p-5 flex flex-col gap-3 justify-between flex-grow text-left">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-slate-450 font-bold">
                      <span>⏰ {recipe.cookingTime} Mins</span>
                      <span>🔥 {recipe.calories} kcal</span>
                    </div>
                    <h3 className="font-display font-bold text-slate-850 dark:text-slate-100 text-base leading-tight truncate">{recipe.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{recipe.description}</p>
                  </div>

                  {/* Healthy Alternative advice from bot */}
                  {recipe.healthyAlternative && (
                    <div className="p-3 bg-brand/5 border border-brand/10 rounded-2xl flex items-start gap-2 text-[10px] text-slate-600 dark:text-slate-400 mt-2">
                      <span className="text-brand font-bold shrink-0">💡 Chef Tip:</span>
                      <p className="italic">{recipe.healthyAlternative}</p>
                    </div>
                  )}

                  {recipe._id ? (
                    <Link 
                      to={`/recipe/${recipe._id}`}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1 mt-3"
                    >
                      Start Cooking <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-semibold text-center mt-2 flex items-center justify-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Temporary Custom AI Meal
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default AIRecommendation;
