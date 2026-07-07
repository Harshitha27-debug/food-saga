import React from 'react';
import { ChefHat, Sparkles, Calendar, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col gap-16 text-left max-w-4xl mx-auto w-full">
      
      {/* Brand values Hero */}
      <section className="text-center flex flex-col gap-4">
        <h1 className="text-4xl md:text-5xl font-display font-black leading-tight">
          Saga of Gastronomy & <span className="text-brand">Technology</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Food Saga combines modern web components, responsive calendars, and artificial intelligence models to structure home cooking.
        </p>
      </section>

      {/* Grid of features explanation */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'AI Cooking Assistant', desc: 'Interact with Chef Saga, get substitutes, boil rules, or preheating safety tips instantly.', icon: <Sparkles className="w-6 h-6 text-brand" /> },
          { title: 'Responsive Calendars', desc: 'Schedule Breakfast, Lunch, and Dinner slots using smooth drag-and-drop actions.', icon: <Calendar className="w-6 h-6 text-accent" /> },
          { title: 'Grocery checklists compiler', desc: 'Compile ingredients from all scheduled recipes into a merged, printable PDF checklist.', icon: <Award className="w-6 h-6 text-indigo-500" /> }
        ].map((item, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl flex flex-col gap-3 shadow-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 self-start">
              {item.icon}
            </div>
            <h3 className="font-display font-bold text-slate-850 dark:text-slate-100 text-sm mt-1">{item.title}</h3>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Visual story */}
      <section className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200/50">
        <div className="flex-grow rounded-2xl overflow-hidden aspect-[4/3] w-full max-h-72 shadow-sm shrink-0 md:w-80">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80" alt="Kitchen story" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-4">
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider self-start">Our Vision</span>
          <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">Elevating home cooking</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            Cooking should be an inspiring art, not a chore. By integrating micro nutrition metrics, interactive timers, speech synthesis reading tools, and AI recommendation engines, Food Saga bridges the gap between culinary craft and coding efficiency.
          </p>
        </div>
      </section>

    </div>
  );
};

export default About;
