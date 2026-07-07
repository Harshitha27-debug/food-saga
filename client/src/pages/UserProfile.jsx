import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Award, Flame, Mail, Calendar, 
  Edit, Save, ShieldAlert, Sparkles, Check 
} from 'lucide-react';

const UserProfile = () => {
  const { user, token, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [photoURL, setPhotoURL] = useState(user?.profilePicture || '');

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await updateProfile({ name: name.trim(), profilePicture: photoURL.trim() });
    if (res.success) {
      setEditMode(false);
      alert('Profile updated successfully!');
    }
  };

  const defaultAchievements = [
    { title: 'Signed Up!', description: 'Welcome to Food Saga', unlockedAt: new Date() },
    { title: 'Daily Chef', description: 'Maintained cooking streak', unlockedAt: new Date() }
  ];

  const achievements = user?.achievements?.length > 0 ? user.achievements : defaultAchievements;
  const badges = user?.badges?.length > 0 ? user.badges : ['Kitchen Novice', 'First Steps'];

  return (
    <div className="flex flex-col gap-8 text-left max-w-4xl mx-auto w-full">
      
      {/* 1. TOP PROFILE SECTION */}
      <section className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between border border-slate-200/50">
        <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
          {/* Avatar */}
          <div className="w-24 h-24 bg-brand/10 text-brand border-2 border-brand/20 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden shadow-md shrink-0">
            {user?.profilePicture || photoURL ? (
              <img src={user?.profilePicture || photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name.charAt(0).toUpperCase()
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
                  <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">{user?.name}</h2>
                  <button onClick={() => setEditMode(true)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"><Edit className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-slate-500 text-xs flex items-center justify-center md:justify-start gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</p>
                <p className="text-xs font-semibold text-orange-500 flex items-center justify-center md:justify-start gap-1 mt-1">🔥 {user?.streak || 0}-Day Cooking Streak</p>
              </>
            )}
          </div>
        </div>

        {/* Quick summary badges count */}
        <div className="flex gap-4 shrink-0 text-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-center">
          <div>
            <h3 className="text-2xl font-display font-black text-brand">{badges.length}</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Badges</p>
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-accent">{achievements.length}</h3>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Achievements</p>
          </div>
        </div>
      </section>

      {/* COLUMNS: BADGES & ACCOMPLISHMENTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Badges list */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Award className="w-5 h-5 text-brand" /> Cooking Badges
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-105/50 rounded-2xl flex items-center gap-3"
              >
                <span className="text-2xl shrink-0">🎖️</span>
                <span className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Timeline */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-slate-200/50">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-accent" /> Achievements Log
          </h3>

          <div className="flex flex-col gap-4">
            {achievements.map((ach, idx) => (
              <div 
                key={idx} 
                className="flex gap-3 text-xs"
              >
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="font-bold text-slate-850 dark:text-slate-100">{ach.title}</h4>
                  <p className="text-slate-500 text-[10px] mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};

export default UserProfile;
