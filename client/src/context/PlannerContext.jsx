import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const PlannerContext = createContext();

export const PlannerProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [shoppingList, setShoppingList] = useState({ items: [] });
  const [notifications, setNotifications] = useState([]);
  const [loadingPlanner, setLoadingPlanner] = useState(false);

  // Helper fetcher with authorization
  const authFetch = async (url, options = {}) => {
    if (!token) return null;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    return await response.json();
  };

  // 1. MEAL PLANNER METHODS
  const fetchMealPlans = async (startDate, endDate) => {
    if (!token) return;
    setLoadingPlanner(true);
    try {
      let url = '/api/mealplans';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await authFetch(url);
      if (data && data.success) {
        setMealPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoadingPlanner(false);
    }
  };

  const addMealPlan = async (planData) => {
    try {
      const data = await authFetch('/api/mealplans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      if (data && data.success) {
        setMealPlans(prev => [...prev, data.data]);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteMealPlan = async (id) => {
    try {
      const data = await authFetch(`/api/mealplans/${id}`, {
        method: 'DELETE'
      });
      if (data && data.success) {
        setMealPlans(prev => prev.filter(mp => mp._id !== id));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error };
    }
  };

  // 2. SHOPPING LIST METHODS
  const fetchShoppingList = async () => {
    if (!token) return;
    try {
      const data = await authFetch('/api/shoppinglist');
      if (data && data.success) {
        setShoppingList(data.data);
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
    }
  };

  const addShoppingItem = async (name, amount) => {
    try {
      const data = await authFetch('/api/shoppinglist', {
        method: 'POST',
        body: JSON.stringify({ name, amount })
      });
      if (data && data.success) {
        setShoppingList(data.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding shopping item:', error);
    }
  };

  const updateShoppingItem = async (itemId, updateData) => {
    try {
      const data = await authFetch(`/api/shoppinglist/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (data && data.success) {
        setShoppingList(data.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating shopping item:', error);
    }
  };

  const deleteShoppingItem = async (itemId) => {
    try {
      const data = await authFetch(`/api/shoppinglist/item/${itemId}`, {
        method: 'DELETE'
      });
      if (data && data.success) {
        setShoppingList(data.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting shopping item:', error);
    }
  };

  const generateShoppingList = async (recipeIds) => {
    try {
      const data = await authFetch('/api/shoppinglist/generate', {
        method: 'POST',
        body: JSON.stringify({ recipeIds })
      });
      if (data && data.success) {
        setShoppingList(data.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
    }
  };

  const clearShoppingList = async (clearCompletedOnly = false) => {
    try {
      const url = `/api/shoppinglist${clearCompletedOnly ? '?clearCompleted=true' : ''}`;
      const data = await authFetch(url, {
        method: 'DELETE'
      });
      if (data && data.success) {
        setShoppingList(data.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Error clearing shopping list:', error);
    }
  };

  // 3. NOTIFICATION METHODS
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await authFetch('/api/notifications');
      if (data && data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const data = await authFetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (data && data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Sync state on login/logout
  useEffect(() => {
    if (token && user) {
      fetchMealPlans();
      fetchShoppingList();
      fetchNotifications();
    } else {
      setMealPlans([]);
      setShoppingList({ items: [] });
      setNotifications([]);
    }
  }, [token, user]);

  return (
    <PlannerContext.Provider value={{
      mealPlans,
      shoppingList,
      notifications,
      loadingPlanner,
      fetchMealPlans,
      addMealPlan,
      deleteMealPlan,
      fetchShoppingList,
      addShoppingItem,
      updateShoppingItem,
      deleteShoppingItem,
      generateShoppingList,
      clearShoppingList,
      fetchNotifications,
      markNotificationRead
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => useContext(PlannerContext);
