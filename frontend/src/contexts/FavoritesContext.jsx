import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('ootd_authToken');

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from API (items with isFavorite: true)
  const loadFavorites = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/closet/my-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Extract IDs of items that are marked as favorite in the database
        const favoriteIds = data.items
          .filter(item => item.isFavorite)
          .map(item => item.id);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (itemId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Optimistic update
      setFavorites((prev) => {
        if (prev.includes(itemId)) {
          return prev.filter((id) => id !== itemId);
        } else {
          return [...prev, itemId];
        }
      });

      // Call API to update database
      const response = await fetch(`/api/closet/${itemId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Revert on failure
        setFavorites((prev) => {
          if (prev.includes(itemId)) {
            return prev.filter((id) => id !== itemId);
          } else {
            return [...prev, itemId];
          }
        });
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (itemId) => {
    return favorites.includes(itemId);
  };

  // Refresh favorites (useful after login or data changes)
  const refreshFavorites = () => {
    loadFavorites();
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
