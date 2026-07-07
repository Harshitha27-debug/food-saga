import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col gap-10 text-left max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-display font-bold">Contact Support</h1>
        <p className="text-slate-500 text-sm mt-0.5">Submit feedback, bug reports, or feature recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Info panel */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-6">
          <h3 className="font-display font-bold text-base text-slate-850 dark:text-slate-100">Reach Us</h3>
          
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Email support</p>
                <p className="text-slate-500 mt-0.5">support@food_saga.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Call helpline</p>
                <p className="text-slate-500 mt-0.5">+1 (800) 555-SAGA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">Office Address</p>
                <p className="text-slate-500 mt-0.5">Vite Tower, Silicon Valley, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="md:col-span-2 glass p-6 rounded-3xl border border-slate-200/50">
          {submitted ? (
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex flex-col gap-2 items-center text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-pulse" />
              <p className="font-bold text-sm">Message Transmitted!</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Your support request has been recorded. Our developers will follow up shortly.
              </p>
              <button onClick={() => setSubmitted(false)} className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold mt-4">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Full Name"
                    required
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="recruiter@tech.com"
                    required
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Message</label>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Describe your suggestion or support request in details..."
                  required
                  rows="4"
                  className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-brand"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="py-3 px-6 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 self-end"
              >
                <Send className="w-4 h-4" /> Dispatch Request
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

export default Contact;
