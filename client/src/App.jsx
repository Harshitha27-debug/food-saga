import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PlannerProvider } from './context/PlannerContext';

// Core Layout
import Layout from './components/Layout';

// Public & Main Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import BrowseRecipes from './pages/BrowseRecipes';
import RecipeDetails from './pages/RecipeDetails';
import Categories from './pages/Categories';
import Community from './pages/Community';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFoundPage from './pages/NotFoundPage';

// User Auth & Profiles
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import UserProfile from './pages/UserProfile';
import Favorites from './pages/Favorites';

// Planner & Shopping lists
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import NutritionDashboard from './pages/NutritionDashboard';

// AI engines
import AIRecommendation from './pages/AIRecommendation';
import AICookingAssistant from './pages/AICookingAssistant';

// Administrative controls
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/Settings';

// Route guards
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlannerProvider>
          <Router>
            <Routes>
              {/* Core layouts wrapper */}
              <Route path="/" element={<Layout />}>
                
                {/* Landing page */}
                <Route index element={<LandingPage />} />
                
                {/* Public Browse catalogs */}
                <Route path="home" element={<Home />} />
                <Route path="browse" element={<BrowseRecipes />} />
                <Route path="recipe/:id" element={<RecipeDetails />} />
                <Route path="categories" element={<Categories />} />
                <Route path="community" element={<Community />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                
                {/* Accounts and sessions */}
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                
                {/* Protected pages */}
                <Route path="profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="planner" element={
                  <ProtectedRoute>
                    <MealPlanner />
                  </ProtectedRoute>
                } />
                <Route path="shopping-list" element={
                  <ProtectedRoute>
                    <ShoppingList />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <NutritionDashboard />
                  </ProtectedRoute>
                } />
                <Route path="recommend" element={
                  <ProtectedRoute>
                    <AIRecommendation />
                  </ProtectedRoute>
                } />
                <Route path="assistant" element={
                  <ProtectedRoute>
                    <AICookingAssistant />
                  </ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />

                {/* Fallbacks */}
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />

              </Route>
            </Routes>
          </Router>
        </PlannerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
