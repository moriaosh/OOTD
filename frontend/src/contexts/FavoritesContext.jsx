import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem('ootd_favorite_items');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('ootd_favorite_items', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId) => {
    setFavorites((prev) => {
      if (prev.includes(itemId)) {
        // Remove from favorites
        return prev.filter((id) => id !== itemId);
      } else {
        // Add to favorites
        return [...prev, itemId];
      }
    });
  };

  const isFavorite = (itemId) => {
    return favorites.includes(itemId);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
