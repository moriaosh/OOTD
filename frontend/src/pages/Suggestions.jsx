import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Sparkles, MapPin, Cloud, Droplets, Wind, RefreshCw, Clock, Heart } from 'lucide-react';
import { closetAPI } from '../services/api';
import ClosetItem from '../components/ClosetItem';
import Layout from '../components/Layout';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('ootd_authToken');

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherMessage, setWeatherMessage] = useState(null);
  const [helpMessage, setHelpMessage] = useState(null);
  const [usingAI, setUsingAI] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const abortControllerRef = useRef(null);

  // Format cache timestamp for display
  const formatCacheTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'עכשיו';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  // Load cached suggestion from database
  const loadFromCache = async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;

      const response = await fetch('/api/closet/cached-suggestion', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cached) {
          const cachedSuggestion = data.cached.suggestion;
          setSuggestions(cachedSuggestion.suggestions || []);
          setWeather(cachedSuggestion.weather || null);
          setWeatherMessage(cachedSuggestion.weatherMessage || null);
          setHelpMessage(cachedSuggestion.message || null);
          setUsingAI(cachedSuggestion.usingAI || false);
          setLocation(data.cached.location || 'Jerusalem,IL');
          setIsFromCache(true);
          setCacheTimestamp(data.cached.createdAt);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error loading cache from database:', err);
      return false;
    }
  };

  // Save suggestion to database cache
  const saveToCache = async (data, cityName) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch('/api/closet/cached-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: cityName,
          weatherData: data.weather || {},
          suggestion: data
        })
      });
    } catch (err) {
      console.error('Error saving cache to database:', err);
    }
  };

  const fetchCalendarRecommendation = async () => {
    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/calendar/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarEvent(data || null);
      } else {
        setCalendarEvent(null);
      }
    } catch (err) {
      console.error('Calendar recommendation error:', err);
      setCalendarEvent(null);
    }
  };


  const fetchSuggestions = async (cityName = null, forceRefresh = false) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false); // Clear cache indicator

      const data = await closetAPI.getSuggestions(cityName);

      setSuggestions(data.suggestions || []);
      setWeather(data.weather || null);
      setWeatherMessage(data.weatherMessage || null);
      setHelpMessage(data.message || null);
      setUsingAI(data.usingAI || false);

      // Save to database cache
      await saveToCache(data, cityName || 'Jerusalem,IL');
      setCacheTimestamp(new Date().toISOString());

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error('Error fetching suggestions:', err);
      setError(err.message || 'שגיאה בשליפת המלצות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeSuggestions = async () => {
      // Try to load from database cache first
      const loaded = await loadFromCache();

      if (!loaded) {
        const defaultCity = 'Jerusalem,IL';
        setLocation(defaultCity);
        await fetchSuggestions(defaultCity);
      } else {
        setLoading(false);
      }

      fetchCalendarRecommendation();
    };

    initializeSuggestions();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleWeatherSearch = (e) => {
    e.preventDefault();
    if (location.trim() && !loading) {
      fetchSuggestions(location.trim());
    }
  };

  const handleSaveOutfit = async (suggestion, index) => {
    const outfitName = prompt('תני שם ללוק הזה:', suggestion.name || `לוק ${index + 1}`);

    if (!outfitName) return;

    try {
      const clotheIds = suggestion.items.map(item => item.id);
      const token = localStorage.getItem('ootd_authToken');

      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: outfitName,
          clotheIds: clotheIds,
          isFavorite: false
        })
      });

      if (response.ok) {
        alert('הלוק נשמר בהצלחה! 💖\nתוכלי לראות אותו בדף "המועדפים שלי"');
      } else {
        alert('שגיאה בשמירת הלוק');
      }
    } catch (error) {
      console.error('Save outfit error:', error);
      alert('שגיאה בשמירת הלוק');
    }
  };

  const handleRefresh = () => {
    if (!loading) {
      fetchSuggestions(location || 'Jerusalem,IL', true);
    }
  };

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
          <div className="flex items-center justify-between w-full">
            <div className="suggestions-title-wrapper">
              <Sparkles className="suggestions-icon" />
              <h1 className="suggestions-title">המלצות לוקים</h1>
                    {calendarEvent && (
                        <div className="mt-3 px-4 py-3 bg-pink-50 border border-pink-300 rounded-xl">
                          <p className="font-bold text-pink-700">
                            📅 לוק מיוחד ל־{calendarEvent.eventName}
                          </p>
                          <p className="text-sm text-pink-600">
                            {calendarEvent.description}
                          </p>
                        </div>
                      )}
              {usingAI && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-2">
                  ✨ AI Fashion Stylist
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isFromCache && cacheTimestamp && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1" title={new Date(cacheTimestamp).toLocaleString('he-IL')}>
                  <Clock className="w-3 h-3" />
                  נשמר {formatCacheTime(cacheTimestamp)}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
                title="רענן המלצות"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                רענן
              </button>
            </div>
          </div>
          <p className="suggestions-subtitle mt-2">
            {usingAI
              ? 'לוקים מותאמים אישית בעזרת בינה מלאכותית - שילובי צבעים חכמים וסגנון טרנדי'
              : 'לוקים מותאמים אישית עבורך על בסיס הפריטים בארון שלך'}
          </p>
        </header>

        {/* Weather Search Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <form onSubmit={handleWeatherSearch} className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <label htmlFor="location" className="font-semibold text-gray-700">
                מיקום למזג אויר:
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="למשל: תל אביב, ירושלים, חיפה..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !location.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                חפש
              </button>
            </div>
          </form>

          {/* Weather Display */}
          {weather && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-bold text-lg text-gray-800">
                    {weather.city}, {weather.country}
                  </h3>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {weather.temperature}°C
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  <span>מרגיש כמו: {weather.feelsLike}°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  <span>לחות: {weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  <span>רוח: {weather.windSpeed} m/s</span>
                </div>
              </div>

              <p className="mt-3 text-sm italic text-gray-600">{weather.description}</p>

              {weatherMessage && (
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-indigo-300">
                  <p className="text-sm font-medium text-indigo-800">
                    💡 {weatherMessage}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {suggestions.length === 0 ? (
          <div className="suggestions-empty">
            <AlertCircle className="empty-icon" />
            <p className="empty-title">אין המלצות זמינות</p>
            <p className="empty-text">
              {helpMessage || 'יש להעלות לפחות 3 פריטים כדי לקבל המלצות לוקים'}
            </p>
          </div>
        ) : (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="suggestion-card-title flex-1">
                      {suggestion.name || `לוק ${index + 1}`}
                    </h2>
                    <button
                      onClick={() => handleSaveOutfit(suggestion, index)}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 font-medium text-sm shadow-md hover:shadow-lg"
                      title="שמור לוק זה"
                    >
                      <Heart className="w-4 h-4" />
                      שמור לוק
                    </button>
                  </div>
                  {suggestion.explanation && (
                    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        {suggestion.explanation}
                      </p>
                    </div>
                  )}
                  {suggestion.styleNotes && (
                    <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold">טיפ סטייל:</span> {suggestion.styleNotes}
                      </p>
                    </div>
                  )}
                </div>
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

