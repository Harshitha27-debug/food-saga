import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await signup(name, email, password);
    setLoading(false);

    if (res.success) {
      navigate('/home');
    } else {
      setErrorMsg(res.message || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 w-full">
      <div className="w-full max-w-md glass rounded-3xl p-6 md:p-8 border border-slate-200/50 flex flex-col gap-6 text-left shadow-premium">
        
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Unlock meal schedules and AI assistance tools.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5">
              <User className="w-4 h-4 text-slate-450 mr-2" />
              <input 
                type="text" 
                placeholder="Elite Developer" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
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
            <CheckCircle className="w-4 h-4" /> Sign Up
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-2">
          Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Sign In</Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
