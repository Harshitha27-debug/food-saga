import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, Bell, Globe, Lock, Shield, 
  ToggleLeft, ToggleRight, CheckCircle2 
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [language, setLanguage] = useState('English');
  const [emailNotif, setEmailNotif] = useState(true);
  const [communityNotif, setCommunityNotif] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-display font-bold">Platform Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Adjust language triggers, notifications, and dark modes.</p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
        
        {/* Core preferences */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-slate-400" /> Language & Aesthetics
          </h3>

          {/* Theme */}
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-350">Dark Mode Interface</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Toggle light and dark color schemes.</p>
            </div>
            <button 
              type="button" 
              onClick={toggleTheme}
              className="p-1 rounded-full text-slate-450"
            >
              {theme === 'dark' ? <ToggleRight className="w-10 h-10 text-brand" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-850 pt-4">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-350">Multilingual Dictionary</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Select preferred localized terminology.</p>
            </div>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl"
            >
              <option value="English">English</option>
              <option value="French">Français</option>
              <option value="Hindi">हिन्दी</option>
              <option value="Spanish">Español</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Bell className="w-4 h-4 text-slate-400" /> Notifications Digests
          </h3>

          {/* Email digests */}
          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-350">Email Digests & Recaps</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Receive weekly custom recipes lists.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setEmailNotif(!emailNotif)}
            >
              {emailNotif ? <ToggleRight className="w-10 h-10 text-brand" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>

          {/* Comments alerts */}
          <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-850 pt-4">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-350">Community Review Notifications</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Notify when users like your custom recipes.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setCommunityNotif(!communityNotif)}
            >
              {communityNotif ? <ToggleRight className="w-10 h-10 text-brand" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-slate-400" /> Security Options
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-350">Two-Factor Passcode</p>
              <p className="text-slate-450 text-[10px] mt-0.5">Enable extra security checks on login.</p>
            </div>
            <button type="button" className="py-2 px-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold">
              Configure
            </button>
          </div>
        </div>

        <button 
          type="submit"
          className="py-3 px-6 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all self-end"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
};

export default SettingsPage;
