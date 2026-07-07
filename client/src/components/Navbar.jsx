import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePlanner } from '../context/PlannerContext';
import { 
  Menu, X, Sun, Moon, Bell, User, LogOut, 
  Settings, LayoutDashboard, Bookmark, Calendar, ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead } = usePlanner();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-brand font-semibold scale-105' : 'text-slate-600 dark:text-slate-300 hover:text-brand transition-colors';
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 glass rounded-2xl py-3 px-6 transition-all duration-300 flex items-center justify-between shadow-premium max-w-7xl mx-auto">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="text-2xl group-hover:animate-bounce">🍳</span>
        <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
          Food Saga
        </span>
      </Link>

      {/* Desktop Navigation links */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/home" className={isActive('/home')}>Home</Link>
        <Link to="/browse" className={isActive('/browse')}>Browse</Link>
        <Link to="/categories" className={isActive('/categories')}>Categories</Link>
        <Link to="/community" className={isActive('/community')}>Community</Link>
        <Link to="/about" className={isActive('/about')}>About</Link>
        <Link to="/contact" className={isActive('/contact')}>Contact</Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Dark/Light mode button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          <>
            {/* Notification trigger */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-brand text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 glass rounded-2xl p-4 shadow-premium z-50 max-h-96 overflow-y-auto">
                  <h4 className="font-bold text-sm mb-3 font-display">Recent Updates</h4>
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4">No notifications yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => markNotificationRead(n._id)}
                          className={`p-3 rounded-xl cursor-pointer transition-colors ${n.isRead ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-brand/10 hover:bg-brand/15'}`}
                        >
                          <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{n.title}</h5>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={toggleProfileDropdown}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:shadow-premium transition-shadow"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-brand/20 text-brand rounded-full flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 glass rounded-2xl p-3 shadow-premium z-50 flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="font-bold text-sm truncate font-display">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    {user.streak > 0 && (
                      <p className="text-[11px] text-orange-500 font-semibold mt-1">🔥 {user.streak}-Day Streak</p>
                    )}
                  </div>
                  
                  <Link 
                    to="/profile" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  <Link 
                    to="/favorites" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" /> Favorites
                  </Link>

                  <Link 
                    to="/planner" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Calendar className="w-4 h-4" /> Meal Planner
                  </Link>

                  <Link 
                    to="/shopping-list" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Shopping List
                  </Link>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Nutrition
                  </Link>

                  <Link 
                    to="/settings" 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-500" /> Admin Panel
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 rounded-xl text-sm hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left w-full mt-1 border-t border-slate-100 dark:border-slate-800/80 pt-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Link 
              to="/login" 
              className="py-2 px-4 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="py-2 px-4 rounded-xl text-sm text-white bg-gradient-premium shadow-premium hover:shadow-premium hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile menu trigger */}
        <button 
          onClick={toggleMobileMenu} 
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 glass rounded-2xl p-6 shadow-premium z-40 flex flex-col gap-4 border border-white/20 mx-4 md:hidden">
          <Link to="/home" onClick={toggleMobileMenu} className={isActive('/home')}>Home</Link>
          <Link to="/browse" onClick={toggleMobileMenu} className={isActive('/browse')}>Browse Recipes</Link>
          <Link to="/categories" onClick={toggleMobileMenu} className={isActive('/categories')}>Categories</Link>
          <Link to="/community" onClick={toggleMobileMenu} className={isActive('/community')}>Community</Link>
          <Link to="/about" onClick={toggleMobileMenu} className={isActive('/about')}>About Us</Link>
          <Link to="/contact" onClick={toggleMobileMenu} className={isActive('/contact')}>Contact</Link>
          
          {!user && (
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/login" onClick={toggleMobileMenu} className="py-2.5 text-center rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                Sign In
              </Link>
              <Link to="/signup" onClick={toggleMobileMenu} className="py-2.5 text-center text-white bg-gradient-premium rounded-xl">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
