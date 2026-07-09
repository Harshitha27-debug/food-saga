import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Send, Volume2, Mic, MicOff, 
  Trash2, ChefHat, HelpCircle, ArrowDown 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const AICookingAssistant = () => {
  const { token } = useAuth();
  
  const [messages, setMessages] = useState([
    { 
      sender: 'assistant', 
      text: "Bonjour! I'm Chef Saga, your AI culinary assistant. Ask me anything about ingredient swaps, boiling times, recipe steps, or general kitchen safety!",
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Use Google Chrome or Microsoft Edge.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Append user message
    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({ sender: m.sender, text: m.text }));
      
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), chatHistory })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.reply,
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation messages?')) {
      setMessages([
        { 
          sender: 'assistant', 
          text: "Let's start fresh! What culinary adventures or substitute questions do you have today?",
          time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const sampleQuestions = [
    "What is a substitute for eggs?",
    "How long do I boil a medium egg?",
    "Safety tip for pan hot preheat?",
    "How to make pasta sauce creamy?"
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto w-full h-[78vh]">
      
      {/* HEADER SECTION */}
      <section className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/50 p-4 rounded-2xl shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-brand" />
          <div>
            <h1 className="font-display font-bold text-sm">Chef Saga AI Assistant</h1>
            <p className="text-[10px] text-slate-400">Culinary chatbot, ready to dictate tips.</p>
          </div>
        </div>

        <button 
          onClick={handleClearHistory}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </section>

      {/* CHAT BUBBLE VIEW */}
      <section className="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-3xl flex flex-col gap-4 shadow-inner">
        {messages.map((m, idx) => {
          const isAssistant = m.sender === 'assistant';
          return (
            <div 
              key={idx}
              className={`flex gap-3 max-w-[80%] ${isAssistant ? 'self-start text-left' : 'self-end flex-row-reverse text-right'}`}
            >
              {/* Profile icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isAssistant ? 'bg-brand/10 text-brand' : 'bg-slate-800 text-white'}`}>
                {isAssistant ? '👨‍🍳' : 'U'}
              </div>

              {/* Message block */}
              <div className="flex flex-col gap-1 min-w-0">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm flex flex-col gap-2 ${isAssistant ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 border border-slate-100 dark:border-slate-800/80 rounded-tl-none' : 'bg-brand text-white rounded-tr-none'}`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  {/* TTS Speaker inside assistant bubble */}
                  {isAssistant && (
                    <button 
                      onClick={() => handleReadAloud(m.text)}
                      className="p-1 hover:bg-slate-105 rounded text-slate-400 hover:text-brand self-start"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 max-w-[80%] self-start">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold animate-bounce">
              👨‍🍳
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse">
              Chef Saga is drafting a tip...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </section>

      {/* QUICK QUESTIONS LIST */}
      {messages.length < 3 && (
        <section className="flex gap-2 flex-wrap justify-center shrink-0">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 hover:border-brand rounded-full text-[10px] text-slate-500 hover:text-brand transition-colors font-semibold"
            >
              ❓ {q}
            </button>
          ))}
        </section>
      )}

      {/* INPUT FORM BOX */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/50 p-2.5 rounded-2xl shrink-0 flex items-center gap-2 shadow-premium">
        {/* Speak Microphone */}
        <button 
          onClick={handleStartSpeech}
          className={`p-2.5 rounded-xl transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          title={isRecording ? 'Listening...' : 'Dictate question'}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input 
          type="text" 
          placeholder={isRecording ? 'Listening dictation...' : 'Ask Chef Saga...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          className="w-full bg-transparent border-none text-xs focus:outline-none py-2 text-slate-850 dark:text-slate-100"
        />

        <button 
          onClick={() => handleSend()}
          className="p-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </section>

    </div>
  );
};

export default AICookingAssistant;
