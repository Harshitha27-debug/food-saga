import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/home');
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    // Call our backend Auth Google handler with mock values
    const res = await googleLogin(
      'google_recruiter@food_saga.com', 
      'Elite Tech Recruiter', 
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    );
    setLoading(false);
    if (res.success) {
      navigate('/home');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 w-full">
      <div className="w-full max-w-md glass rounded-3xl p-6 md:p-8 border border-slate-200/50 flex flex-col gap-6 text-left shadow-premium">
        
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">Welcome Back</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to track macros and unlock achievements.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
              <Mail className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="email" 
                placeholder="recruiter@techcompany.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-brand hover:underline font-bold">Forgot?</Link>
            </div>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
              <Lock className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="password" 
                placeholder="••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </form>

        <div className="flex items-center my-1 text-xs text-slate-400 before:flex-grow before:border-t before:border-slate-200 after:flex-grow after:border-t after:border-slate-200 before:mr-3 after:ml-3">
          or
        </div>

        {/* Google sign-in */}
        <button 
          onClick={handleGoogleSubmit}
          disabled={loading}
          className="py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=32&q=80" alt="Google Logo" className="w-4 h-4" />
          Google Sign In (Demo Fast Pass)
        </button>

        <p className="text-center text-xs text-slate-500 mt-2">
          New to Food Saga? <Link to="/signup" className="text-brand font-bold hover:underline">Create Account</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
