import React from 'react';
import { ChefHat } from 'lucide-react';

const Loader = ({ message = 'Sifting ingredients...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-4 text-center">
      <div className="relative flex items-center justify-center p-6 bg-brand/10 rounded-full text-brand animate-pulse">
        <ChefHat className="w-10 h-10 animate-spin-slow text-brand" />
        <span className="absolute w-20 h-20 border-2 border-brand/30 border-dashed rounded-full animate-spin"></span>
      </div>
      <p className="font-display font-medium text-slate-500 dark:text-slate-400 text-sm tracking-wide mt-2">
        {message}
      </p>
    </div>
  );
};

export default Loader;
