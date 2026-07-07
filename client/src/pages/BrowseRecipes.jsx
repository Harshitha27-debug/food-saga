import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, SlidersHorizontal, Plus, Star, 
  Clock, Flame, Check, Sparkles, ChefHat, X 
} from 'lucide-react';
import Loader from '../components/Loader';

const BrowseRecipes = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [diet, setDiet] = useState('');
  const [sort, setSort] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);

  // Suggestions auto-complete list
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recentSearches') || '[]'));

  // Custom Recipe Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [customDiff, setCustomDiff] = useState('Medium');
  const [customCal, setCustomCal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCategory, setCustomCategory] = useState('Main Course');
  const [customCuisine, setCustomCuisine] = useState('Global');
  const [customDiet, setCustomDiet] = useState([]);
  const [customIngName, setCustomIngName] = useState('');
  const [customIngAmt, setCustomIngAmt] = useState('');
  const [customIngredients, setCustomIngredients] = useState([]);
  const [customStepText, setCustomStepText] = useState('');
  const [customSteps, setCustomSteps] = useState([]);

  // Load URL queries on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search') || '';
    const cat = params.get('category') || '';
    const cuis = params.get('cuisine') || '';
    const sortVal = params.get('sort') || 'popularity';
    const dietVal = params.get('diet') || '';

    setSearch(s);
    setCategory(cat);
    setCuisine(cuis);
    setSort(sortVal);
    setDiet(dietVal);

    fetchRecipes(s, cat, cuis, sortVal, dietVal, 1);
  }, [location.search]);

  const fetchRecipes = (s, cat, cuis, sortVal, dietVal, pageNum) => {
    setLoading(true);
    let url = `/api/recipes?page=${pageNum}&limit=9`;
    if (s) url += `&search=${encodeURIComponent(s)}`;
    if (cat) url += `&category=${encodeURIComponent(cat)}`;
    if (cuis) url += `&cuisine=${encodeURIComponent(cuis)}`;
    if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
    if (dietVal) url += `&diet=${encodeURIComponent(dietVal)}`;
    if (sortVal) url += `&sort=${encodeURIComponent(sortVal)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipes(data.data);
          setTotal(data.total);
          setPage(data.page);
          setPages(data.pages);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  // Autocomplete auto suggest trigger (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim().length > 1) {
        fetch(`/api/recipes?limit=5&search=${encodeURIComponent(search.trim())}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSuggestions(data.data.map(r => r.title));
            }
          });
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const saveToRecentSearches = (term) => {
    if (!term || !term.trim()) return;
    const t = term.trim();
    setRecentSearches(prev => {
      const updated = [t, ...prev.filter(s => s !== t)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchRecipes(search, category, cuisine, sort, diet, 1);
  };

  const handleClearFilters = () => {
    setCategory('');
    setCuisine('');
    setDifficulty('');
    setDiet('');
    setSort('popularity');
    setShowFilters(false);
    fetchRecipes(search, '', '', 'popularity', '', 1);
  };

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    fetchRecipes(search, category, cuisine, sort, diet, pageNum);
  };

  const handleAddIngredient = () => {
    if (customIngName && customIngAmt) {
      setCustomIngredients([...customIngredients, { name: customIngName, amount: customIngAmt }]);
      setCustomIngName('');
      setCustomIngAmt('');
    }
  };

  const handleAddStep = () => {
    if (customStepText) {
      setCustomSteps([...customSteps, { step: customSteps.length + 1, text: customStepText }]);
      setCustomStepText('');
    }
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Sign in required to create custom recipes.');
      return;
    }

    const payload = {
      title: customTitle,
      description: customDesc,
      cookingTime: parseInt(customTime) || 20,
      difficulty: customDiff,
      calories: parseInt(customCal) || 0,
      protein: parseInt(customProt) || 0,
      carbs: parseInt(customCarb) || 0,
      fat: parseInt(customFat) || 0,
      category: customCategory,
      cuisine: customCuisine,
      dietTags: customDiet,
      ingredients: customIngredients,
      instructions: customSteps
    };

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const d = await res.json();
      if (d.success) {
        setShowCustomModal(false);
        // Reset form
        setCustomTitle('');
        setCustomDesc('');
        setCustomTime('');
        setCustomCal('');
        setCustomProt('');
        setCustomCarb('');
        setCustomFat('');
        setCustomIngredients([]);
        setCustomSteps([]);
        alert('Recipe successfully created!');
        fetchRecipes(search, category, cuisine, sort, diet, 1);
      } else {
        alert(d.message || 'Creation failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cuisinesList = ['Italian', 'Indian', 'French', 'Mediterranean', 'American', 'Global'];
  const categoriesList = ['Breakfast', 'Chicken', 'Beef', 'Vegetarian', 'Pasta', 'Seafood', 'Dessert'];
  const dietsList = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein'];

  return (
    <div className="flex flex-col gap-8 text-left relative">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Catalog Discovery</h1>
          <p className="text-slate-500 text-sm mt-0.5">Explore {total} exquisite recipes curated by home chefs.</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setShowCustomModal(true)}
            className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-premium hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Custom Recipe
          </button>
        )}
      </section>

      {/* SEARCH AND FILTERS BUTTON ROW */}
      <section className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-grow w-full">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, ingredient..."
              value={search}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  saveToRecentSearches(search);
                  fetchRecipes(search, category, cuisine, sort, diet, 1);
                  setShowSuggestions(false);
                }
              }}
              className="bg-transparent focus:outline-none w-full ml-2 text-sm text-slate-850 dark:text-slate-100"
            />
            {search && (
              <button onClick={() => { setSearch(''); fetchRecipes('', category, cuisine, sort, diet, 1); }}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown (with Recent Searches support) */}
          {showSuggestions && (
            <div className="absolute top-12 left-0 right-0 glass rounded-xl shadow-premium p-2.5 z-30 flex flex-col gap-1 border border-slate-200/50">
              {suggestions.length > 0 ? (
                <>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 px-2">Suggestions</p>
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onMouseDown={() => {
                        setSearch(sug);
                        saveToRecentSearches(sug);
                        fetchRecipes(sug, category, cuisine, sort, diet, 1);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-105 dark:hover:bg-slate-800 text-xs rounded-lg truncate text-slate-700 dark:text-slate-300"
                    >
                      🔍 {sug}
                    </button>
                  ))}
                </>
              ) : recentSearches.length > 0 && !search ? (
                <>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 px-2">Recent Searches</p>
                  {recentSearches.map((sug, i) => (
                    <button
                      key={i}
                      onMouseDown={() => {
                        setSearch(sug);
                        fetchRecipes(sug, category, cuisine, sort, diet, 1);
                      }}
                      className="w-full text-left p-2 hover:bg-slate-105 dark:hover:bg-slate-800 text-xs rounded-lg truncate text-slate-650 dark:text-slate-400"
                    >
                      ⏳ {sug}
                    </button>
                  ))}
                </>
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-2 italic font-semibold">Type to search recipes...</p>
              )}
            </div>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 py-2.5 px-4 glass-card rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 w-full sm:w-auto justify-center"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </section>

      {/* EXPANDABLE FILTERS PANEL */}
      {showFilters && (
        <section className="glass rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Meal Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Cuisine */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cuisine Style</label>
            <select 
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Cuisines</option>
              {cuisinesList.map((cuis, idx) => <option key={idx} value={cuis}>{cuis}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Cooking Difficulty</label>
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Diet Preferences */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Dietary Needs</label>
            <select 
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="">No Restrictions</option>
              {dietsList.map((dt, idx) => <option key={idx} value={dt}>{dt}</option>)}
            </select>
          </div>

          {/* Sort options */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Sort Result By</label>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="cookingTime">Cooking Time</option>
              <option value="calories">Calorie Bounds</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2 md:col-span-3">
            <button 
              onClick={handleApplyFilters}
              className="py-2.5 px-6 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold w-full sm:w-auto"
            >
              Apply Filter Selection
            </button>
            <button 
              onClick={handleClearFilters}
              className="py-2.5 px-6 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold w-full sm:w-auto"
            >
              Reset Filters
            </button>
          </div>
        </section>
      )}

      {/* RECIPE GRID LISTING */}
      {loading ? (
        <Loader message="Gathering recipes..." />
      ) : recipes.length === 0 ? (
        <div className="p-12 text-center glass rounded-2xl">
          <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-850 dark:text-slate-100">No Recipes Found</h4>
          <p className="text-slate-500 text-xs mt-1">Try resetting your queries or adjust ingredient searches.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'} 
                    alt={recipe.title} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] text-white font-bold">
                    {recipe.category}
                  </span>
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
                  
                  {/* Macros info pill */}
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {recipe.dietTags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-2">
                    <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" /> {recipe.cookingTime} Mins</span>
                    <span className="flex items-center gap-0.5"><Flame className="w-3.5 h-3.5" /> {recipe.calories} kcal</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINATION SECTION */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold"
              >
                Previous
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${page === i + 1 ? 'bg-brand text-white' : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* CREATE CUSTOM RECIPE DIALOG SHEETS */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium w-full max-w-2xl max-h-[85vh] overflow-y-auto text-left relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-display font-bold mb-4">Create Your Culinary Masterpiece</h2>

            <form onSubmit={handleSaveRecipe} className="flex flex-col gap-5">
              {/* Title & Desc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Recipe Title</label>
                  <input 
                    type="text" 
                    value={customTitle} 
                    onChange={e => setCustomTitle(e.target.value)} 
                    placeholder="e.g. Grandma's Apple Pie" 
                    required
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Description</label>
                  <input 
                    type="text" 
                    value={customDesc} 
                    onChange={e => setCustomDesc(e.target.value)} 
                    placeholder="Brief description of the dish..." 
                    required
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Time, Difficulty, Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Cooking Time (minutes)</label>
                  <input 
                    type="number" 
                    value={customTime} 
                    onChange={e => setCustomTime(e.target.value)} 
                    placeholder="e.g. 25" 
                    required
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Difficulty</label>
                  <select 
                    value={customDiff} 
                    onChange={e => setCustomDiff(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Category</label>
                  <select 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                  >
                    {categoriesList.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Nutrition */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Calories (kcal)</label>
                  <input type="number" value={customCal} onChange={e => setCustomCal(e.target.value)} placeholder="0" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Protein (g)</label>
                  <input type="number" value={customProt} onChange={e => setCustomProt(e.target.value)} placeholder="0" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Carbs (g)</label>
                  <input type="number" value={customCarb} onChange={e => setCustomCarb(e.target.value)} placeholder="0" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400">Fat (g)</label>
                  <input type="number" value={customFat} onChange={e => setCustomFat(e.target.value)} placeholder="0" className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none" />
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400">Diet Tags</label>
                <div className="flex flex-wrap gap-2">
                  {dietsList.map((dTag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (customDiet.includes(dTag)) {
                          setCustomDiet(customDiet.filter(d => d !== dTag));
                        } else {
                          setCustomDiet([...customDiet, dTag]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${customDiet.includes(dTag) ? 'bg-brand text-white border-brand' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                      {dTag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients Form Section */}
              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="text-xs font-bold text-slate-400">Ingredients ({customIngredients.length})</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Flour" 
                    value={customIngName} 
                    onChange={e => setCustomIngName(e.target.value)} 
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none flex-grow"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. 200g" 
                    value={customIngAmt} 
                    onChange={e => setCustomIngAmt(e.target.value)} 
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none w-24"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddIngredient}
                    className="px-4 bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
                {/* List */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {customIngredients.map((ing, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs border border-slate-200/50">
                      {ing.name} ({ing.amount})
                      <button type="button" onClick={() => setCustomIngredients(customIngredients.filter((_, i) => i !== idx))} className="text-red-500 font-bold hover:scale-110">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions steps section */}
              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <label className="text-xs font-bold text-slate-400">Instructions ({customSteps.length})</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. Preheat the oven..." 
                    value={customStepText} 
                    onChange={e => setCustomStepText(e.target.value)} 
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none flex-grow"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddStep}
                    className="px-4 bg-slate-800 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Add Step
                  </button>
                </div>
                {/* Steps List */}
                <div className="flex flex-col gap-1.5 mt-1 text-xs">
                  {customSteps.map((step, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200/50 p-2.5 rounded-xl">
                      <p className="truncate"><span className="font-bold text-brand">Step {step.step}:</span> {step.text}</p>
                      <button type="button" onClick={() => setCustomSteps(customSteps.filter((_, i) => i !== idx))} className="text-red-500 font-bold hover:scale-110 ml-2">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action submits */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowCustomModal(false)}
                  className="py-2.5 px-6 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={customIngredients.length === 0 || customSteps.length === 0}
                  className="py-2.5 px-6 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrowseRecipes;
