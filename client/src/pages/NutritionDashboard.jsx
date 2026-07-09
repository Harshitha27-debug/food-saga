import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, Flame, Trash2, CheckCircle, Award, 
  ChevronRight, Plus, Droplets, Smile, Dumbbell 
} from 'lucide-react';
import Loader from '../components/Loader';

// Chart.js Integrations
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  BarElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = import.meta.env.VITE_API_URL || '';

const NutritionDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);

  // Water tracking
  const [waterCups, setWaterCups] = useState(0);

  // BMI calculator
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiLoading, setBmiLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNutritionStats();
  }, [token]);

  const fetchNutritionStats = () => {
    setLoading(true);
    fetch(`${API_URL}/api/nutrition`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNutritionData(data.data);
          setWaterCups(data.data.waterCups);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleLogWater = async (amount) => {
    try {
      const res = await fetch(`${API_URL}/api/nutrition/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        setWaterCups(data.waterCups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBmiSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !height) return;

    setBmiLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/nutrition/bmi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(weight), height: parseFloat(height) })
      });
      const data = await res.json();
      if (data.success) {
        setBmiResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBmiLoading(false);
    }
  };

  if (loading) return <Loader message="Analyzing nutrition logs..." />;

  // 1. Chart configurations: Calories Weekly Bar Chart
  const weeklyLabels = nutritionData?.weeklyData.map(d => d.date) || [];
  const weeklyCalories = nutritionData?.weeklyData.map(d => d.calories) || [];

  const barChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'Calories (kcal)',
        data: weeklyCalories,
        backgroundColor: 'rgba(255, 107, 107, 0.75)',
        borderColor: '#ff6b6b',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
      x: { grid: { display: false } }
    }
  };

  // 2. Chart configurations: Today's Macro distribution Doughnut
  const macrosToday = nutritionData?.todayTotals || { protein: 0, carbs: 0, fat: 0 };
  const doughnutChartData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
    datasets: [
      {
        data: [macrosToday.protein, macrosToday.carbs, macrosToday.fat],
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)', // Green
          'rgba(241, 196, 15, 0.8)', // Yellow
          'rgba(52, 152, 219, 0.8)'  // Blue
        ],
        borderWidth: 1
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
    }
  };

  return (
    <div className="flex flex-col gap-10 text-left">
      
      {/* HEADER SECTION */}
      <section>
        <h1 className="text-3xl font-display font-bold">Nutrition Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Aggregated metrics of your caloric totals and body goals.</p>
      </section>

      {/* CORE GRID: CHARTS & METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Calories Weekly Bar Chart */}
        <div className="md:col-span-2 glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">Weekly Calorie Consumption</h3>
          <div className="h-64 flex items-center justify-center">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Today's Macro Distribution doughnut */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100">Today's Macro Targets</h3>
          <div className="h-48 flex items-center justify-center">
            {(macrosToday.protein + macrosToday.carbs + macrosToday.fat === 0) ? (
              <p className="text-slate-400 text-xs text-center py-10">No meals logged today. Schedule something in the calendar!</p>
            ) : (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            )}
          </div>
          <div className="text-center text-[10px] text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-850 pt-3">
            Calories target hit: {nutritionData?.todayTotals.calories || 0} / 2200 kcal
          </div>
        </div>

      </section>

      {/* WATER INTENSIVE TRACKER & BMI CALCULATOR ROW */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Water Intake tracker widget */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-5 justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <Droplets className="w-5 h-5 text-blue-500 fill-blue-500" /> Water Tracker
              </h3>
              <p className="text-slate-500 text-xs">Record cups of water. Stay hydrated!</p>
            </div>
            <span className="text-sm font-display font-black text-blue-500">{waterCups} / 8 Cups</span>
          </div>

          {/* Visual water grid */}
          <div className="flex gap-2 flex-wrap py-2 justify-center">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-9 h-12 rounded-lg border-2 flex items-end overflow-hidden ${idx < waterCups ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40' : 'border-slate-200 dark:border-slate-800 bg-transparent'}`}
              >
                {idx < waterCups && <div className="w-full h-4/5 bg-blue-500 animate-pulse"></div>}
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => handleLogWater(1)}
              className="py-2 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              +1 Cup
            </button>
            <button 
              onClick={() => handleLogWater(2)}
              className="py-2 px-5 bg-blue-500/10 hover:bg-blue-500/15 text-blue-500 rounded-xl text-xs font-bold border border-blue-500/20"
            >
              +2 Cups
            </button>
          </div>
        </div>

        {/* BMI Calculator Widget */}
        <div className="glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Dumbbell className="w-5 h-5 text-emerald-500" /> BMI Calculator
          </h3>
          
          <form onSubmit={handleBmiSubmit} className="flex gap-3">
            <input 
              type="number" 
              placeholder="Height (cm)" 
              value={height}
              onChange={e => setHeight(e.target.value)}
              required
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand w-full"
            />
            <input 
              type="number" 
              placeholder="Weight (kg)" 
              value={weight}
              onChange={e => setWeight(e.target.value)}
              required
              className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand w-full"
            />
            <button 
              type="submit"
              disabled={bmiLoading}
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 text-white font-bold rounded-xl text-xs shrink-0"
            >
              Calc
            </button>
          </form>

          {/* Result block */}
          {bmiResult && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-200">
              <div>
                <p className="text-slate-400">BMI Rating Score</p>
                <p className="font-display font-black text-xl text-slate-850 dark:text-slate-100 mt-1">{bmiResult.bmi}</p>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-${bmiResult.color}-500/10 text-${bmiResult.color}-500`}>
                  {bmiResult.status}
                </span>
                <p className="text-[10px] text-slate-450 mt-1">Normal: {bmiResult.range}</p>
              </div>
            </div>
          )}
        </div>

      </section>

    </div>
  );
};

export default NutritionDashboard;
