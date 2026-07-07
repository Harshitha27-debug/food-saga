import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Star, Heart, MessageCircle, Plus } from 'lucide-react';
import Loader from '../components/Loader';

const Community = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch custom community recipes
    fetch('/api/recipes?limit=9')
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setRecipes(d.data);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Setting up the community table..." />;

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* HEADER SECTION */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Chef's Table</h1>
          <p className="text-slate-500 text-sm mt-0.5">Browse creations, read reviews, and share culinary tricks.</p>
        </div>
        <Link 
          to="/browse"
          className="py-2.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-semibold shadow-premium flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Share Recipe
        </Link>
      </section>

      {/* COMMUNITY FEED */}
      {recipes.length === 0 ? (
        <div className="p-16 text-center glass rounded-3xl mt-2">
          <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-display font-bold">No community recipes</h3>
          <p className="text-slate-500 text-xs mt-1">Be the first to publish a custom recipe to the Chef's Table!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div 
              key={recipe._id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
            >
              <div className="p-5 flex flex-col gap-3">
                {/* Creator Profile line */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    {recipe.source.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-850 dark:text-slate-100">{recipe.source === 'Custom' ? 'Home Chef' : recipe.source}</h4>
                    <p className="text-[10px] text-slate-400">Published recipe</p>
                  </div>
                </div>

                {recipe.image && (
                  <Link to={`/recipe/${recipe._id}`} className="aspect-[16/10] w-full rounded-2xl overflow-hidden block">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </Link>
                )}

                <div className="flex flex-col gap-1.5 text-left mt-1">
                  <Link to={`/recipe/${recipe._id}`}>
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 hover:text-brand transition-colors text-base leading-tight">
                      {recipe.title}
                    </h3>
                  </Link>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{recipe.description}</p>
                </div>
              </div>

              {/* Engagement icons bar */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs text-slate-450 font-bold shrink-0">
                <span className="flex items-center gap-1">⏰ {recipe.cookingTime} Mins</span>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 hover:text-brand">
                    <Heart className="w-4 h-4" /> {recipe.popularity || 12}
                  </button>
                  <Link to={`/recipe/${recipe._id}`} className="flex items-center gap-1 hover:text-brand">
                    <MessageCircle className="w-4 h-4" /> {recipe.reviewsCount || 0}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Community;
