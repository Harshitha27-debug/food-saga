import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Instagram, Twitter, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand details */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
              Food Saga
            </span>
          </Link>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Crafting premium culinary journeys. Track macros, design diet schedules, and cook with Michelin-grade AI assistance.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-brand hover:scale-110 shadow-sm transition-all"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-brand hover:scale-110 shadow-sm transition-all"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-brand hover:scale-110 shadow-sm transition-all"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider">Features</h4>
          <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/browse" className="hover:text-brand transition-colors">Search & Browse</Link>
            <Link to="/planner" className="hover:text-brand transition-colors">Meal Planner</Link>
            <Link to="/dashboard" className="hover:text-brand transition-colors">Nutrition Tracker</Link>
            <Link to="/assistant" className="hover:text-brand transition-colors">AI Cooking Chat</Link>
          </div>
        </div>

        {/* Legal & About */}
        <div>
          <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wider">Company</h4>
          <div className="flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/about" className="hover:text-brand transition-colors">About Food Saga</Link>
            <Link to="/contact" className="hover:text-brand transition-colors">Contact Support</Link>
            <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Newsletter</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Subscribe for fresh weekly recipes and expert health tips directly in your inbox.
          </p>
          
          {subscribed ? (
            <div className="p-3 bg-brand/10 text-brand text-xs font-semibold rounded-xl animate-pulse">
              🎉 Subscription successful! Welcome to the family.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1 shadow-sm">
              <input 
                type="email" 
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent text-sm w-full py-2 px-3 focus:outline-none text-slate-800 dark:text-slate-100" 
              />
              <button 
                type="submit" 
                className="p-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 Food Saga Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-brand fill-brand" /> for gourmet developers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
