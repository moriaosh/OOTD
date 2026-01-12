import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Loader2, Trash2, Heart } from 'lucide-react';
import Layout from '../components/Layout';

const Favorites = () => {
  const navigate = useNavigate();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('http://localhost:5000/api/outfits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedOutfits(data);
      }
    } catch (err) {
      console.error('Error fetching outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleDeleteOutfit = async (outfitId) => {
    if (!confirm('האם את בטוחה שברצונך למחוק את הלוק הזה?')) {
      return;
    }

    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch(`http://localhost:5000/api/outfits/${outfitId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchOutfits();
        alert('הלוק נמחק בהצלחה!');
      }
    } catch (error) {
      console.error('Delete outfit error:', error);
      alert('שגיאה במחיקת הלוק');
    }
  };

  const handleToggleFavorite = async (outfitId) => {
    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch(`http://localhost:5000/api/outfits/${outfitId}/favorite`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchOutfits();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const favoriteOutfits = savedOutfits.filter(outfit => outfit.isFavorite);

  return (
    <Layout>
      <div className="closet-container" dir="rtl">
        <header className="closet-header">
          <h1 className="closet-title">
            <Heart className="w-8 h-8 inline-block ml-2 text-pink-500 fill-pink-500" />
            הלוקים השמורים שלי
          </h1>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 ml-3" />
            <span className="text-lg text-gray-700">טוען לוקים...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && savedOutfits.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              עדיין לא שמרת לוקים 💔
            </h2>
            <p className="text-gray-500 mb-6">
              עברי להמלצות לוקים ושמרי את הלוקים שאת הכי אוהבת!
            </p>
            <button
              onClick={() => navigate('/suggestions')}
              className="action-btn primary"
            >
              לכי להמלצות לוקים
            </button>
          </div>
        )}

        {/* Saved Outfits Grid */}
        {!loading && savedOutfits.length > 0 && (
          <>
            <div className="intro-box">
              <p>
                💖 {savedOutfits.length} לוקים שמורים
                {favoriteOutfits.length > 0 && ` (${favoriteOutfits.length} מועדפים)`}
                <br />
                הלוקים השלמים ששמרת מופיעים כאן!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Outfit Header */}
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{outfit.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleFavorite(outfit.id)}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              outfit.isFavorite
                                ? 'fill-yellow-300 text-yellow-300'
                                : 'text-white'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteOutfit(outfit.id)}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 mt-1">
                      {outfit.items?.length || 0} פריטים
                    </p>
                  </div>

                  {/* Outfit Items Grid */}
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {outfit.items && outfit.items.length > 0 ? (
                      outfit.items.map((item, index) => (
                        <div key={index} className="aspect-square">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg shadow-sm"
                          />
                        </div>
                      ))
                    ) : (
                      <p className="col-span-3 text-center text-gray-500 py-4">
                        הפריטים נמחקו
                      </p>
                    )}
                  </div>

                  {/* Outfit Footer */}
                  <div className="px-4 pb-4 text-xs text-gray-500">
                    נשמר ב-{new Date(outfit.createdAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
