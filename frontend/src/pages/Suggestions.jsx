import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { closetAPI } from '../services/api';
import ClosetItem from '../components/ClosetItem';
import Layout from '../components/Layout';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await closetAPI.getSuggestions();
        setSuggestions(data.suggestions || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError(err.message || 'שגיאה בשליפת המלצות');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">מייצר המלצות לוקים...</p>
        </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">שגיאה</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="suggestions-container" dir="rtl">
      <div className="suggestions-wrapper">
        <header className="suggestions-header">
          <div className="suggestions-title-wrapper">
            <Sparkles className="suggestions-icon" />
            <h1 className="suggestions-title">המלצות לוקים</h1>
          </div>
          <p className="suggestions-subtitle">
            לוקים מותאמים אישית עבורך על בסיס הפריטים בארון שלך
          </p>
        </header>

        {suggestions.length === 0 ? (
          <div className="suggestions-empty">
            <AlertCircle className="empty-icon" />
            <p className="empty-title">אין המלצות זמינות</p>
            <p className="empty-text">
              יש להעלות לפחות 3 פריטים כדי לקבל המלצות לוקים
            </p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card">
                <h2 className="suggestion-card-title">
                  {suggestion.name || `לוק ${index + 1}`}
                </h2>
                <div className="suggestion-items-grid">
                  {suggestion.items?.map((item, itemIndex) => (
                    <ClosetItem key={itemIndex} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default Suggestions;

