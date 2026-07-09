import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlanner } from '../context/PlannerContext';
import { 
  Clock, Award, Flame, Heart, 
  Calendar, Star, Send, Printer, Volume2, 
  VolumeX, Play, Pause, RotateCcw, AlertTriangle, CheckSquare, Plus, Share2
} from 'lucide-react';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || '';

const RecipeDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { addMealPlan, generateShoppingList, fetchShoppingList } = usePlanner();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  
  // Scheduling overlay
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleType, setScheduleType] = useState('Lunch');

  // Interactive Cooking Timer
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);

  // Speech Reader
  const [speaking, setSpeaking] = useState(false);
  const [currentSpeechStep, setCurrentSpeechStep] = useState(-1);
  const speechUtteranceRef = useRef(null);

  // Reviews/Comments states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [commentText, setCommentText] = useState('');

  // Similar recipes list
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetchRecipeData();
    checkIfFavorited();
  }, [id]);

  useEffect(() => {
    if (recipe) {
      const currentViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const item = { id: recipe._id, title: recipe.title, image: recipe.image };
      const updated = [item, ...currentViewed.filter(v => v.id !== recipe._id)].slice(0, 5);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [recipe]);

  const fetchRecipeData = () => {
    setLoading(true);
    fetch(`${API_URL}/api/recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipe(data.data);
          // Fetch similar recipes
          fetch(`${API_URL}/api/recipes?limit=3&category=${encodeURIComponent(data.data.category)}`)
            .then(res => res.json())
            .then(simData => {
              if (simData.success) {
                // Filter current recipe out
                setSimilar(simData.data.filter(r => r._id !== id));
              }
            });
        } else {
          navigate('/404');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const checkIfFavorited = () => {
    if (!token) return;
    fetch(`${API_URL}/api/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const favorited = data.data.some(f => f.recipeId === id);
          setIsFav(favorited);
        }
      });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Recipe link copied to clipboard!');
  };

  const handleFavoriteToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const method = isFav ? 'DELETE' : 'POST';
    const url = isFav ? `${API_URL}/api/favorites/${id}` : `${API_URL}/api/favorites`;
    const body = isFav ? null : JSON.stringify({
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      cuisine: recipe.cuisine,
      category: recipe.category
    });

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body
      });
      const d = await res.json();
      if (d.success) {
        setIsFav(!isFav);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleMeal = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    const payload = {
      date: scheduleDate,
      mealType: scheduleType,
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      recipeImage: recipe.image,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat
    };

    const res = await addMealPlan(payload);
    if (res.success) {
      setShowScheduleModal(false);
      alert(`Successfully scheduled ${recipe.title} for ${scheduleType} on ${scheduleDate}`);
    } else {
      alert('Error scheduling meal. Try again.');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const res = await generateShoppingList([recipe._id]);
    if (res && res.success) {
      alert('Ingredients successfully imported into your Shopping List!');
      fetchShoppingList();
    }
  };

  // Timer Methods
  const startTimer = () => {
    if (timerActive) return;
    setTimerActive(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(sec => {
        if (sec > 0) return sec - 1;
        // sec is 0
        setTimerMinutes(min => {
          if (min > 0) {
            setTimerSeconds(59);
            return min - 1;
          }
          // min and sec are 0
          clearInterval(timerIntervalRef.current);
          setTimerActive(false);
          playAlarm();
          return 0;
        });
        return 0;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (!timerActive) return;
    clearInterval(timerIntervalRef.current);
    setTimerActive(false);
  };

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerActive(false);
    setTimerMinutes(10);
    setTimerSeconds(0);
  };

  const playAlarm = () => {
    // Check speech/voice synth buzzer fallback
    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance("Timer completed! Check your food!");
      synth.speak(utterance);
    } catch (e) {
      alert('Ding! Cooking timer completed!');
    }
  };

  // Text-To-Speech Step Reader
  const toggleStepReading = (stepIndex, text) => {
    if (speaking && currentSpeechStep === stepIndex) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setCurrentSpeechStep(-1);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Step ${stepIndex + 1}: ${text}`);
    utterance.onend = () => {
      setSpeaking(false);
      setCurrentSpeechStep(-1);
    };
    
    speechUtteranceRef.current = utterance;
    setSpeaking(true);
    setCurrentSpeechStep(stepIndex);
    window.speechSynthesis.speak(utterance);
  };

  // Submitting Reviews
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipe._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, reviewText })
      });
      const d = await res.json();
      if (d.success) {
        setReviewText('');
        alert('Review published successfully!');
        fetchRecipeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submitting Comments
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/recipes/${recipe._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentText })
      });
      const d = await res.json();
      if (d.success) {
        setCommentText('');
        alert('Comment posted!');
        fetchRecipeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader message="Sautéing the details..." />;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div className="flex flex-col gap-10 text-left">
      
      {/* 1. HERO HEADER WITH FLOATING INFOS */}
      <section className="relative rounded-3xl overflow-hidden min-h-[45vh] flex items-end p-6 md:p-12 shadow-premium bg-slate-900">
        <img 
          src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'} 
          alt={recipe.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-brand rounded-full text-xs font-bold uppercase tracking-wider">{recipe.category}</span>
              <span className="px-3 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">{recipe.cuisine}</span>
              {recipe.dietTags && recipe.dietTags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-500/30 backdrop-blur-md border border-emerald-500/20 text-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">{tag}</span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black leading-tight max-w-2xl">{recipe.title}</h1>
            <p className="text-slate-350 text-sm max-w-xl line-clamp-2">{recipe.description}</p>
          </div>

          <div className="flex gap-3 self-start md:self-auto shrink-0">
            <button 
              onClick={handleFavoriteToggle}
              className={`p-3 rounded-2xl border transition-all ${isFav ? 'bg-brand border-brand text-white' : 'bg-white/10 border-white/25 hover:bg-white/20 text-white'}`}
              title="Save to Favorites"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-3 rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Share Recipe Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="py-3 px-5 bg-white text-slate-950 rounded-2xl text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-700" /> Plan Meal
            </button>
            <button 
              onClick={handleAddToShoppingList}
              className="py-3 px-5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-xs font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" /> Add Ingredients
            </button>
          </div>
        </div>
      </section>

      {/* 2. CORE METRICS STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
        {[
          { label: 'Time Required', val: `${recipe.cookingTime} Mins`, icon: <Clock className="w-4 h-4 text-slate-400 mx-auto" /> },
          { label: 'Difficulty', val: recipe.difficulty, icon: <Award className="w-4 h-4 text-slate-400 mx-auto" /> },
          { label: 'Calories', val: `${recipe.calories} kcal`, icon: <Flame className="w-4 h-4 text-slate-400 mx-auto" /> },
          { label: 'Protein Intake', val: `${recipe.protein} g`, icon: '💪' },
          { label: 'Carbs', val: `${recipe.carbs} g`, icon: '🍞' },
          { label: 'Fat Quantity', val: `${recipe.fat} g`, icon: '🥑' }
        ].map((item, idx) => (
          <div key={idx} className="p-4 glass rounded-2xl flex flex-col gap-1 items-center">
            {typeof item.icon === 'string' ? <span className="text-base">{item.icon}</span> : item.icon}
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-1">{item.label}</span>
            <span className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">{item.val}</span>
          </div>
        ))}
      </section>

      {/* 3. COLUMNS: INGREDIENTS VS INSTRUCTIONS */}
      <section className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Ingredients Block */}
        <div className="w-full md:w-1/3 glass p-6 rounded-3xl flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display font-bold text-base text-slate-850 dark:text-slate-100">Required Ingredients</h3>
            <button 
              onClick={() => window.print()}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="Print Recipe"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-900">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{ing.name}</span>
                <span className="text-slate-500 font-semibold">{ing.amount}</span>
              </div>
            ))}
          </div>

          {/* Cooking Timer Widget */}
          <div className="mt-4 p-4 rounded-2xl bg-brand/5 border border-brand/10 text-center flex flex-col gap-3">
            <h4 className="font-display font-bold text-xs text-brand uppercase tracking-wider">Active Cooking Timer</h4>
            
            {/* Visual timer digits */}
            <div className="text-3xl font-display font-black text-slate-800 dark:text-slate-200">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              <button 
                onClick={timerActive ? pauseTimer : startTimer}
                className="p-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center"
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Set minutes picker */}
            <div className="flex items-center gap-2 justify-center text-xs">
              <span className="text-slate-500">Mins:</span>
              <input 
                type="number" 
                value={timerMinutes}
                onChange={e => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={timerActive}
                className="w-12 p-1 border rounded bg-white dark:bg-slate-900 text-center focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step-by-step directions */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">Step-by-Step Cooking Steps</h3>
          
          <div className="flex flex-col gap-4">
            {recipe.instructions.map((step, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border transition-all flex gap-4 ${currentSpeechStep === idx ? 'bg-brand/5 border-brand/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80'}`}
              >
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div className="flex-grow flex flex-col gap-2">
                  <p className="text-slate-700 dark:text-slate-350 text-xs leading-relaxed">{step.text}</p>
                  
                  {/* TTS sound reader trigger */}
                  <button 
                    onClick={() => toggleStepReading(idx, step.text)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-brand self-start mt-1"
                  >
                    {currentSpeechStep === idx ? <VolumeX className="w-3.5 h-3.5 text-brand" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {currentSpeechStep === idx ? 'Stop Speaking' : 'Read Out Loud'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Embedded cooking video if URL is present */}
          {recipe.videoUrl && (
            <div className="mt-4 flex flex-col gap-4">
              <h3 className="font-display font-bold text-lg">Embedded Cooking Tutorial</h3>
              <div className="rounded-3xl overflow-hidden aspect-video shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950">
                <iframe
                  src={recipe.videoUrl}
                  title="Cooking Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. REVIEWS & COMMENTS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800/80 pt-10">
        
        {/* Reviews column */}
        <div className="flex flex-col gap-6">
          <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">Reviews & Ratings ({recipe.reviewsCount || 0})</h3>
          
          {/* Post review form */}
          {token ? (
            <form onSubmit={handleAddReview} className="p-5 glass rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button 
                      key={num} 
                      type="button" 
                      onClick={() => setRating(num)}
                      className="p-0.5"
                    >
                      <Star className={`w-4 h-4 ${rating >= num ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                placeholder="Share your culinary review..." 
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
                rows="2"
                className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand"
              ></textarea>
              <button 
                type="submit"
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 self-end"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500"><Link to="/login" className="text-brand font-semibold hover:underline">Log in</Link> to write a recipe review.</p>
          )}

          {/* List reviews */}
          <div className="flex flex-col gap-4">
            {(!recipe.reviews || recipe.reviews.length === 0) ? (
              <p className="text-xs text-slate-500">No reviews posted yet.</p>
            ) : (
              recipe.reviews.map(rev => (
                <div key={rev._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand/20 text-brand rounded-full flex items-center justify-center text-[10px] font-bold">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.userName}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">"{rev.reviewText}"</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* General discussion comments column */}
        <div className="flex flex-col gap-6">
          <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">Cooking Discussions</h3>

          {/* Form */}
          {token ? (
            <form onSubmit={handleAddComment} className="p-5 glass rounded-2xl flex flex-col gap-3">
              <textarea 
                placeholder="Ask a question or offer tips for this recipe..." 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                required
                rows="2"
                className="w-full p-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand"
              ></textarea>
              <button 
                type="submit"
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 self-end"
              >
                <Send className="w-3.5 h-3.5" /> Post Comment
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500"><Link to="/login" className="text-brand font-semibold hover:underline">Log in</Link> to post comments.</p>
          )}

          {/* List */}
          <div className="flex flex-col gap-4">
            {(!recipe.comments || recipe.comments.length === 0) ? (
              <p className="text-xs text-slate-500">No comments posted yet.</p>
            ) : (
              recipe.comments.map(com => (
                <div key={com._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand/20 text-brand rounded-full flex items-center justify-center text-[10px] font-bold">
                      {com.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{com.userName}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-400 text-xs leading-relaxed">{com.commentText}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. SIMILAR RECIPES SECTION */}
      {similar.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-10">
          <h3 className="font-display font-bold text-lg">You might also like</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similar.map(recipe => (
              <Link 
                key={recipe._id} 
                to={`/recipe/${recipe._id}`} 
                className="group flex gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:shadow-premium hover:-translate-y-1 transition-all duration-350"
              >
                <img src={recipe.image} alt={recipe.title} loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex flex-col gap-1 min-w-0 justify-center">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-brand transition-colors">{recipe.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{recipe.cuisine} • {recipe.cookingTime} Mins</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SCHEDULING CALENDAR MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={handleScheduleMeal} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-premium w-full max-w-sm flex flex-col gap-5 text-left">
            <h3 className="font-display font-bold text-base">Schedule to Meal Planner</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Choose Date</label>
              <input 
                type="date" 
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                required
                className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Meal Type</label>
              <select 
                value={scheduleType}
                onChange={e => setScheduleType(e.target.value)}
                className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
              <button 
                type="button" 
                onClick={() => setShowScheduleModal(false)}
                className="py-2 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="py-2 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold"
              >
                Schedule Meal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default RecipeDetails;
