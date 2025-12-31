import { useState, useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { closetAPI } from '../services/api';
import ClosetItem from '../components/ClosetItem';
import Layout from '../components/Layout';

const Favorites = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosetItems = async () => {
      try {
        setLoading(true);
        const data = await closetAPI.getMyItems();
        setClosetItems(data);
      } catch (err) {
        console.error('Error fetching closet items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosetItems();
  }, []);

  // Filter to show only favorited items
  const favoriteItems = closetItems.filter(item => favorites.includes(item.id));

  return (
    <Layout>
      <div className="closet-container" dir="rtl">
        <header className="closet-header">
          <h1 className="closet-title">
            <Star className="w-8 h-8 inline-block ml-2 text-yellow-500 fill-yellow-500" />
            הפריטים המועדפים שלי
          </h1>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 ml-3" />
            <span className="text-lg text-gray-700">טוען מועדפים...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && favoriteItems.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              עדיין לא סימנת פריטים מועדפים 💔
            </h2>
            <p className="text-gray-500 mb-6">
              חזרי לארון ולחצי על הכוכב ⭐ בפריטים שאת הכי אוהבת!
            </p>
            <button
              onClick={() => navigate('/closet')}
              className="action-btn primary"
            >
              לכי לארון שלי
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        {!loading && favoriteItems.length > 0 && (
          <>
            <div className="intro-box">
              <p>
                ⭐ {favoriteItems.length} פריטים מועדפים
                <br />
                הפריטים שסימנת בכוכב מופיעים כאן!
              </p>
            </div>

            <div className="closet-grid">
              {favoriteItems.map((item) => (
                <ClosetItem key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
