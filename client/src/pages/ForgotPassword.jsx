import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 w-full">
      <div className="w-full max-w-md glass rounded-3xl p-6 md:p-8 border border-slate-200/50 flex flex-col gap-6 text-left shadow-premium">
        
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-850 dark:text-slate-100">Reset Password</h2>
          <p className="text-slate-500 text-xs mt-1">Provide your email to receive recovery instructions.</p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex flex-col gap-2 items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <p className="font-bold text-xs">Reset Instructions Dispatched!</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              Check your inbox at <strong>{email}</strong> for instructions to finalize password resets.
            </p>
            <Link to="/login" className="text-brand font-bold text-xs mt-3 hover:underline">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <button 
              type="submit"
              className="py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              Dispatch Reset Link
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
