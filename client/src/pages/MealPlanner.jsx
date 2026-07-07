import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Flame, Trash2, ArrowRight, 
  Sparkles, CheckSquare, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import Loader from '../components/Loader';

const MealPlanner = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const { 
    mealPlans, fetchMealPlans, deleteMealPlan, 
    addMealPlan, generateShoppingList, loadingPlanner 
  } = usePlanner();

  // Weekly layout dates
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust start to Monday
    return new Date(d.setDate(diff));
  });

  const [suggestions, setSuggestions] = useState(null);
  const [draggedMealId, setDraggedMealId] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadCurrentWeekPlans();
    fetchSuggestions();
  }, [currentWeekStart, token]);

  const loadCurrentWeekPlans = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    
    fetchMealPlans(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const fetchSuggestions = () => {
    fetch('/api/mealplans/suggestions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) setSuggestions(d.suggestions);
      });
  };

  const changeWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setCurrentWeekStart(newStart);
  };

  // Generate date array for the week
  const weekDates = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + idx);
    return d;
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const getMealsForDayAndType = (dateStr, type) => {
    return mealPlans.filter(mp => 
      new Date(mp.date).toDateString() === new Date(dateStr).toDateString() &&
      mp.mealType === type
    );
  };

  const getDailyCalorieTally = (dateStr) => {
    const dayMeals = mealPlans.filter(mp => 
      new Date(mp.date).toDateString() === new Date(dateStr).toDateString()
    );
    return dayMeals.reduce((acc, m) => acc + m.calories, 0);
  };

  const handleGenerateShoppingList = async () => {
    const recipeIds = mealPlans.map(m => m.recipeId);
    if (recipeIds.length === 0) {
      alert('Please schedule some meals first!');
      return;
    }
    
    const res = await generateShoppingList(recipeIds);
    if (res && res.success) {
      alert('Grocery list compiled successfully! Opening Shopping List...');
      navigate('/shopping-list');
    }
  };

  const handleQuickAddSuggestion = async (recipe, type) => {
    const payload = {
      date: new Date().toISOString().split('T')[0], // Add for today
      mealType: type,
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat
    };

    const res = await addMealPlan(payload);
    if (res && res.success) {
      alert(`Scheduled ${recipe.title} for ${type} today.`);
      loadCurrentWeekPlans();
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, mealPlanId) => {
    setDraggedMealId(mealPlanId);
    e.dataTransfer.setData('text/plain', mealPlanId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = async (e, dateStr, type) => {
    e.preventDefault();
    const mealId = draggedMealId || e.dataTransfer.getData('text/plain');
    if (!mealId) return;

    const targetMeal = mealPlans.find(m => m._id === mealId);
    if (!targetMeal) return;

    // Remove old, add new
    setLoadingPlanner(true);
    try {
      await deleteMealPlan(mealId);
      
      const payload = {
        date: dateStr,
        mealType: type,
        recipeId: targetMeal.recipeId,
        recipeTitle: targetMeal.recipeTitle,
        recipeImage: targetMeal.recipeImage,
        calories: targetMeal.calories,
        protein: targetMeal.protein,
        carbs: targetMeal.carbs,
        fat: targetMeal.fat
      };

      await addMealPlan(payload);
      loadCurrentWeekPlans();
    } catch (err) {
      console.error(err);
    } finally {
      setDraggedMealId(null);
    }
  };

  const [loadingLocalState, setLoadingPlanner] = useState(false);

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Meal Planner</h1>
          <p className="text-slate-500 text-sm mt-0.5">Design diet sheets, reschedule meals, and generate ingredients checklists.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleGenerateShoppingList}
            className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <CheckSquare className="w-4 h-4" /> Compile Shopping List
          </button>
        </div>
      </section>

      {/* WEEK TOGGLER CONTROL */}
      <section className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/50 p-4 rounded-2xl">
        <div className="flex items-center gap-1">
          <Calendar className="w-5 h-5 text-brand" />
          <span className="font-display font-bold text-sm">
            Week: {weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => changeWeek(-1)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => changeWeek(1)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* GRID CALENDAR SHEET */}
      {(loadingPlanner || loadingLocalState) ? (
        <Loader message="Syncing calendar..." />
      ) : (
        <section className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-slate-900">
          <table className="w-full min-w-[800px] border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80">
                <th className="p-4 text-left font-bold text-slate-400 uppercase w-32">Day</th>
                {mealTypes.map((type, idx) => (
                  <th key={idx} className="p-4 text-left font-bold text-slate-400 uppercase">{type}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekDates.map((dateObj, dIdx) => {
                const dateStr = dateObj.toISOString().split('T')[0];
                const dailyKcal = getDailyCalorieTally(dateStr);
                const isLimitExceeded = dailyKcal > 2200;

                return (
                  <tr key={dIdx} className="border-b border-slate-100 dark:border-slate-850">
                    {/* Day name label & daily Kcal progress bar */}
                    <td className="p-4 font-display font-bold text-slate-700 dark:text-slate-350 border-r border-slate-100 dark:border-slate-850">
                      <p>{daysOfWeek[dIdx]}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {dateObj.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                      
                      {/* Calories badge */}
                      <div className={`mt-3 p-1 px-2 rounded-lg text-[10px] inline-block font-semibold ${isLimitExceeded ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        🔥 {dailyKcal} kcal
                      </div>
                    </td>

                    {/* Meal slots columns */}
                    {mealTypes.map((type, tIdx) => {
                      const slotsMeals = getMealsForDayAndType(dateStr, type);

                      return (
                        <td 
                          key={tIdx} 
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dateStr, type)}
                          className="p-3 w-48 align-top hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-r border-slate-100 dark:border-slate-850"
                        >
                          <div className="flex flex-col gap-2 min-h-24">
                            {slotsMeals.map(meal => (
                              <div 
                                key={meal._id}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, meal._id)}
                                className="p-2.5 rounded-2xl glass-card flex flex-col gap-1.5 shadow-sm relative group cursor-grab active:cursor-grabbing border border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-900/50"
                              >
                                <p className="font-bold text-[11px] truncate text-slate-800 dark:text-slate-200">{meal.recipeTitle}</p>
                                <span className="text-[9px] text-slate-450 font-semibold">🔥 {meal.calories} kcal</span>
                                
                                <button 
                                  onClick={() => deleteMealPlan(meal._id)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {slotsMeals.length === 0 && (
                              <div className="text-[10px] text-slate-350 text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center">
                                Drop Meal
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* AUTO MEAL SUGGESTIONS BAR */}
      {suggestions && (
        <section className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-brand" /> Auto Meal Suggestions
              </h2>
              <p className="text-slate-500 text-xs">Based on macro recommendations, quick adds for today.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(suggestions).map(([mealType, recipe]) => (
              <div 
                key={mealType}
                className="p-5 glass rounded-3xl border border-slate-200/50 dark:border-slate-850 flex gap-4 items-center justify-between"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <img src={recipe.image} alt={recipe.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="px-2 py-0.5 bg-brand/10 text-brand text-[9px] font-bold uppercase rounded">{mealType}</span>
                    <h4 className="font-display font-bold text-xs mt-1 truncate text-slate-800 dark:text-slate-100">{recipe.title}</h4>
                    <span className="text-[10px] text-slate-450">⏰ {recipe.cookingTime}m • 🔥 {recipe.calories} kcal</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleQuickAddSuggestion(recipe, mealType)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl shrink-0"
                  title="Add to Schedule Today"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default MealPlanner;
