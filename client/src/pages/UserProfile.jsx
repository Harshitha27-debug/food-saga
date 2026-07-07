import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Award, Flame, Mail, Calendar, 
  Edit, Save, ShieldAlert, Sparkles, Check, Heart, Eye, Search, Clock
} from 'lucide-react';

const UserProfile = () => {
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [photoURL, setPhotoURL] = useState(user?.profilePicture || '');

  // Dynamic user data states
  const [favorites, setFavorites] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Fetch user favorites
    fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setFavorites(data.data);
      })
      .catch(err => console.error('Error fetching profile favorites:', err));

    // 2. Fetch user meal plans
    fetch('/api/mealplans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMealPlans(data.data);
      })
      .catch(err => console.error('Error fetching profile meal plans:', err));

    // 3. Load recent searches
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(searches);

    // 4. Load recently viewed
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed);
  }, [token]);

  if (!token) {
    return null;
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await updateProfile({ name: name.trim(), profilePicture: photoURL.trim() });
    if (res.success) {
      setEditMode(false);
    }
  };

  const defaultAchievements = [
    { title: 'Signed Up!', description: 'Welcome to Food Saga', unlockedAt: new Date() },
    { title: 'Daily Chef', description: 'Maintained cooking streak', unlockedAt: new Date() }
  ];

  const achievements = user?.achievements?.length > 0 ? user.achievements : defaultAchievements;
  const badges = user?.badges?.length > 0 ? user.badges : ['Kitchen Novice', 'First Steps'];

  return (
    <div className="flex flex-col gap-10 text-left max-w-4xl mx-auto w-full">
      
      {/* 1. TOP PROFILE SECTION */}
      <section className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-200/50">
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar */}
          <div className="w-24 h-24 bg-brand/10 text-brand border-2 border-brand/20 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden shadow-md shrink-0">
            {user?.profilePicture || photoURL ? (
              <img src={user?.profilePicture || photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>

          <div className="text-center md:text-left flex flex-col gap-1 w-full">
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-2 w-full max-w-xs">
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Full Name"
                  required
                  className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
                <input 
                  type="text" 
                  value={photoURL} 
                  onChange={e => setPhotoURL(e.target.value)} 
                  placeholder="Profile Image URL"
                  className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="py-1 px-3 bg-brand text-white rounded-lg text-[10px] font-bold flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                  <button type="button" onClick={() => setEditMode(false)} className="py-1 px-3 border rounded-lg text-[10px] font-bold">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">{user?.name || 'Gourmet User'}</h2>
                  <button onClick={() => setEditMode(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Edit className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-slate-500 text-xs flex items-center justify-center md:justify-start gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</p>
                <p className="text-xs font-semibold text-orange-500 flex items-center justify-center md:justify-start gap-1 mt-1">🔥 {user?.streak || 0}-Day Cooking Streak</p>
              </>
            )}
          </div>
        </div>

        {/* Quick summary metrics */}
        <div className="flex gap-4 shrink-0 text-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
          <div>
            <h3 className="text-2xl font-display font-black text-brand">{badges.length}</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Badges</p>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-accent">{achievements.length}</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Achievements</p>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-indigo-500">{favorites.length}</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Favorites</p>
          </div>
        </div>
      </section>

      {/* 2. FAVORITES AND MEAL PLANS SECTIONS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Favorites list */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand fill-brand" /> Favorite Recipes ({favorites.length})
          </h3>
          
          {favorites.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No favorites saved yet. Start browsing!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {favorites.map((fav) => (
                <Link 
                  key={fav._id} 
                  to={`/recipe/${fav.recipeId}`}
                  className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-850 rounded-2xl transition-all"
                >
                  <img src={fav.recipeImage} alt={fav.recipeTitle} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{fav.recipeTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fav.cuisine} • {fav.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Meal plans checklist */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" /> Scheduled Meals ({mealPlans.length})
          </h3>

          {mealPlans.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No meals planned yet. Use the Meal Planner!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {mealPlans.slice(0, 8).map((plan) => (
                <div 
                  key={plan._id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <img src={plan.recipeImage} alt={plan.recipeTitle} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{plan.recipeTitle}</p>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-450 font-bold uppercase tracking-wide mt-1 inline-block">{plan.mealType}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-slate-500">{new Date(plan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* 3. RECENT SEARCHES AND RECENTLY VIEWED */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent Searches */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-500" /> Recent Search Queries
          </h3>

          {recentSearches.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No recent searches.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((searchQuery, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/browse?search=${encodeURIComponent(searchQuery)}`)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand hover:border-brand/40 transition-all flex items-center gap-1.5"
                >
                  <Clock className="w-3 h-3 text-slate-400" /> {searchQuery}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-500" /> Recently Viewed
          </h3>

          {recentlyViewed.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No recipes viewed recently.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentlyViewed.map((viewed) => (
                <Link 
                  key={viewed.id} 
                  to={`/recipe/${viewed.id}`}
                  className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-105 rounded-2xl transition-all"
                >
                  <img src={viewed.image} alt={viewed.title} className="w-10 h-10 object-cover rounded-xl shrink-0" />
                  <p className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{viewed.title}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Badges section */}
      <section className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
        <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Award className="w-5 h-5 text-brand" /> Cooking Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-3"
            >
              <span className="text-2xl shrink-0">🎖️</span>
              <span className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs">{badge}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default UserProfile;
