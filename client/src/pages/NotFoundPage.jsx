import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, AlertTriangle, ArrowRight } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center gap-6 px-4">
      <div className="p-5 bg-brand/10 text-brand border border-brand/20 rounded-full animate-bounce">
        <ChefHat className="w-14 h-14" />
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-4xl font-display font-black text-slate-800 dark:text-slate-100">Recipe Burnt!</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          The page you are looking for has been boiled away, eaten, or moved to another kitchen shelf.
        </p>
      </div>

      <Link 
        to="/home"
        className="py-3 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all mt-2"
      >
        Return to Home Feed <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default NotFoundPage;
