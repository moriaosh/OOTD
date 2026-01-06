import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { initializeActivityMonitoring, isInactive, clearSession, updateLastActivity } from '../utils/authTimeout';

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
    const checkAuth = () => {
      const token = authAPI.isAuthenticated();
      const currentUser = authAPI.getCurrentUser();

      if (token && currentUser) {
        // Check for inactivity before setting user
        if (isInactive()) {
          console.log('🔒 User inactive for >1 hour. Auto-logging out...');
          clearSession();
          return;
        }
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Also listen for storage changes (in case of multiple tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Start activity monitoring when user is authenticated
  useEffect(() => {
    if (!user) return;

    console.log('🔒 Starting inactivity monitoring (1 hour timeout)');
    const cleanup = initializeActivityMonitoring();

    return () => {
      console.log('🔒 Stopping inactivity monitoring');
      if (cleanup) cleanup();
    };
  }, [user]);

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

  // Compute isAuthenticated based on both state and localStorage check
  // This ensures it's accurate even during page transitions
  const isAuthenticated = React.useMemo(() => {
    const hasToken = authAPI.isAuthenticated();
    const hasUser = !!user || !!authAPI.getCurrentUser();
    return hasToken && hasUser;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

