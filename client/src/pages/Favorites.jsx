import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Star, Trash2, ArrowRight } from 'lucide-react';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || '';

const Favorites = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [token]);

  const fetchFavorites = () => {
    setLoading(true);
    fetch(`${API_URL}/api/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFavorites(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRemoveFavorite = async (recipeId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`${API_URL}/api/favorites/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(prev => prev.filter(f => f.recipeId !== recipeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader message="Revisiting your bookmarks..." />;

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-3xl font-display font-bold">Your Bookmarked Creations</h1>
        <p className="text-slate-500 text-sm mt-0.5">Quickly retrieve recipes you favorited or saved for later.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="p-16 text-center glass rounded-3xl max-w-xl mx-auto w-full mt-6">
          <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-100">No bookmarks saved</h3>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Browse our recipe catalog and press the heart icon to save items to this space.
          </p>
          <Link 
            to="/browse"
            className="py-2.5 px-5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 mt-4 hover:scale-105 transition-transform"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map(fav => (
            <Link 
              key={fav._id} 
              to={`/recipe/${fav.recipeId}`} 
              className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img 
                  src={fav.recipeImage || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'} 
                  alt={fav.recipeTitle} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                
                {/* Remove button */}
                <button 
                  onClick={(e) => handleRemoveFavorite(fav.recipeId, e)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">{fav.cuisine}</span>
                  <span className="px-2 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-bold uppercase">{fav.category}</span>
                </div>
                <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors truncate">
                  {fav.recipeTitle}
                </h3>
                <span className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5 self-start mt-2">
                  View Recipe <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
