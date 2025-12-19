import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authAPI.getCurrentUser();
    if (currentUser && authAPI.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('🟡 AuthContext: Starting login...');
    const data = await authAPI.login(email, password);
    console.log('🟡 AuthContext: Login API call completed', data);
    
    // Ensure user is set in state after login
    if (data.user) {
      console.log('🟡 AuthContext: Setting user from response', data.user);
      setUser(data.user);
    } else {
      // Fallback: get user from localStorage if not in response
      const storedUser = authAPI.getCurrentUser();
      console.log('🟡 AuthContext: Getting user from localStorage', storedUser);
      if (storedUser) {
        setUser(storedUser);
      }
    }
    console.log('🟡 AuthContext: Login function completed');
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    if (data.token) {
      localStorage.setItem('ootd_authToken', data.token);
      if (data.user) {
        localStorage.setItem('ootd_currentUser', JSON.stringify(data.user));
        setUser(data.user);
      }
    }
    return data;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && authAPI.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

