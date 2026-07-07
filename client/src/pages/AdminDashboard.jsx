import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, ChefHat, MessageSquare, Calendar, 
  Trash2, ShieldAlert, ShieldCheck, ToggleLeft, ToggleRight 
} from 'lucide-react';
import Loader from '../components/Loader';

// Chart.js integrations
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, recipes
  const [usersList, setUsersList] = useState([]);
  const [recipesList, setRecipesList] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => {
        if (d.success) setMetrics(d.data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const loadUsers = () => {
    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => { if (d.success) setUsersList(d.data); });
  };

  const loadRecipes = () => {
    fetch('/api/recipes?limit=20')
      .then(res => res.json())
      .then(d => { if (d.success) setRecipesList(d.data); });
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const d = await res.json();
      if (d.success) {
        setUsersList(prev => prev.map(u => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setUsersList(prev => prev.filter(u => u._id !== userId && u.id !== userId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'users') loadUsers();
    if (tabName === 'recipes') loadRecipes();
  };

  if (loading) return <Loader message="Compiling admin dashboard metrics..." />;

  // 1. Chart configurations: Signups Trend Line Chart
  const trendLabels = metrics?.signupsTrend.map(t => t.month) || [];
  const trendSignups = metrics?.signupsTrend.map(t => t.signups) || [];
  const trendRecipes = metrics?.signupsTrend.map(t => t.recipesCreated) || [];

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Users Signups',
        data: trendSignups,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.35,
        fill: true
      },
      {
        label: 'Recipes Created',
        data: trendRecipes,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.35,
        fill: true
      }
    ]
  };

  // 2. Chart configurations: Category Distribution Doughnut
  const categoryLabels = metrics?.categoryStats.map(c => c.name) || [];
  const categoryPercentages = metrics?.categoryStats.map(c => c.percentage) || [];

  const doughnutChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryPercentages,
        backgroundColor: ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6'],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="flex flex-col gap-8 text-left">
      
      {/* HEADER SECTION */}
      <section>
        <h1 className="text-3xl font-display font-bold">Administration Control</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control configurations, analyze metrics, and review community members.</p>
      </section>

      {/* STATS TILES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: metrics?.totalUsers, icon: <Users className="w-5 h-5 text-indigo-500" /> },
          { label: 'Recipes Catalog', val: metrics?.totalRecipes, icon: <ChefHat className="w-5 h-5 text-rose-500" /> },
          { label: 'Ratings Written', val: metrics?.totalReviews, icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
          { label: 'Scheduled Meals', val: metrics?.mealPlansScheduled, icon: <Calendar className="w-5 h-5 text-emerald-500" /> }
        ].map((item, i) => (
          <div key={i} className="p-5 glass rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
              <span className="font-display font-black text-xl text-slate-800 dark:text-slate-200">{item.val}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
              {item.icon}
            </div>
          </div>
        ))}
      </section>

      {/* TABS BUTTON BAR */}
      <section className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {['analytics', 'users', 'recipes'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${activeTab === tab ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* TAB 1: ANALYTICS GRAPHS */}
      {activeTab === 'analytics' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User trends */}
          <div className="md:col-span-2 glass p-6 rounded-3xl">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Registration & Recipes Trends</h3>
            <div className="h-64 flex items-center justify-center">
              <Line data={lineChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>

          {/* Categories */}
          <div className="glass p-6 rounded-3xl">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Category Breakdown (%)</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={doughnutChartData} options={{ responsive: true, cutout: '60%', plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: USER ACCOUNT LIST */}
      {activeTab === 'users' && (
        <section className="glass rounded-3xl overflow-hidden border border-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-400">User Profile Name</th>
                  <th className="p-4 font-bold text-slate-400">Email Address</th>
                  <th className="p-4 font-bold text-slate-400">System Role</th>
                  <th className="p-4 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u._id || u.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4 font-semibold text-slate-750 dark:text-slate-200">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1 ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-850 text-slate-500'}`}>
                        {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleRole(u._id || u.id, u.role)}
                        className="py-1 px-3 border border-slate-250 dark:border-slate-800 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px]"
                      >
                        Toggle Role
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u._id || u.id)}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: RECIPES MANAGEMENT */}
      {activeTab === 'recipes' && (
        <section className="glass rounded-3xl overflow-hidden border border-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-400">Recipe Title</th>
                  <th className="p-4 font-bold text-slate-400">Cuisine / Category</th>
                  <th className="p-4 font-bold text-slate-400">Cooking Details</th>
                  <th className="p-4 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipesList.map(r => (
                  <tr key={r._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="p-4 font-semibold text-slate-750 dark:text-slate-200">{r.title}</td>
                    <td className="p-4 text-slate-500">{r.cuisine} • {r.category}</td>
                    <td className="p-4 text-slate-550">⏰ {r.cookingTime} Mins • 🔥 {r.calories} kcal</td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link 
                        to={`/recipe/${r._id}`}
                        className="py-1 px-3 border border-slate-250 dark:border-slate-800 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px]"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
};

export default AdminDashboard;
