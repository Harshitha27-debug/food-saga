import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight } from 'lucide-react';

const Categories = () => {
  const categoriesList = [
    { name: 'Breakfast', emoji: '🍳', count: 12, desc: 'Healthy starts, visual poached eggs, oats, and morning treats.', color: 'from-amber-400 to-orange-500' },
    { name: 'Pasta', emoji: '🍝', count: 8, desc: 'Classic Carbonara, creamy sauces, and authentic Italian dough.', color: 'from-red-400 to-rose-600' },
    { name: 'Salad', emoji: '🥗', count: 14, desc: 'Crispy green Buddha bowls, roasted vegetables, and tahini.', color: 'from-green-400 to-emerald-600' },
    { name: 'Curry', emoji: '🍛', count: 10, desc: 'Paneer tikka, spicy Indian masalas, and rich butter sauces.', color: 'from-yellow-400 to-amber-600' },
    { name: 'Seafood', emoji: '🐟', count: 6, desc: 'Grilled salmon, snap-crisp asparagus, and lemon butter fillets.', color: 'from-blue-400 to-indigo-600' },
    { name: 'Dessert', emoji: '🍰', count: 9, desc: 'Gourmet sweet pies, dark chocolate soufflés, and light cakes.', color: 'from-purple-400 to-pink-600' }
  ];

  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <h1 className="text-3xl font-display font-bold">Culinary Categories</h1>
        <p className="text-slate-500 text-sm mt-0.5">Filter search catalogs by your favorite domains.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categoriesList.map((cat, i) => (
          <Link 
            key={i}
            to={`/browse?category=${cat.name}`}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between gap-5 group"
          >
            <div className="flex items-center justify-between">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                {cat.emoji}
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                {cat.count} Recipes
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100 group-hover:text-brand transition-colors">
                {cat.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                {cat.desc}
              </p>
            </div>

            <span className="text-xs font-bold text-brand hover:underline flex items-center gap-1.5 self-start group-hover:gap-2.5 transition-all">
              Browse Category <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
