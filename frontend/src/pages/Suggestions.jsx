import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Sparkles, MapPin, Cloud, Droplets, Wind, RefreshCw, Clock } from 'lucide-react';
import { closetAPI } from '../services/api';
import ClosetItem from '../components/ClosetItem';
import Layout from '../components/Layout';

// Cache keys
const CACHE_KEYS = {
  SUGGESTIONS: 'ootd_cached_suggestions',
  LOCATION: 'ootd_last_location',
  TIMESTAMP: 'ootd_suggestions_timestamp'
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherMessage, setWeatherMessage] = useState(null);
  const [helpMessage, setHelpMessage] = useState(null);
  const [usingAI, setUsingAI] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const abortControllerRef = useRef(null);

  // Check if cache is still valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
  };

  // Load from cache
  const loadFromCache = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.SUGGESTIONS);
      const cachedLocation = localStorage.getItem(CACHE_KEYS.LOCATION);

      if (cachedData && isCacheValid()) {
        const data = JSON.parse(cachedData);
        setSuggestions(data.suggestions || []);
        setWeather(data.weather || null);
        setWeatherMessage(data.weatherMessage || null);
        setHelpMessage(data.message || null);
        setUsingAI(data.usingAI || false);
        setLocation(cachedLocation || 'Jerusalem,IL');
        setIsFromCache(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cache:', err);
      return false;
    }
  };

  // Save to cache
  const saveToCache = (data, cityName) => {
    try {
      localStorage.setItem(CACHE_KEYS.SUGGESTIONS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.LOCATION, cityName);
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (err) {
      console.error('Error saving cache:', err);
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

      // Save to cache
      saveToCache(data, cityName || 'Jerusalem,IL');

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
    // Try to load from cache first
    const loaded = loadFromCache();

    if (!loaded) {
      // No cache - load with default city
      const defaultCity = 'Jerusalem,IL';
      setLocation(defaultCity);
      fetchSuggestions(defaultCity);
    } else {
      setLoading(false);
    }

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
              {usingAI && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-2">
                  ✨ AI Fashion Stylist
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isFromCache && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  שמור במטמון
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
                  <h2 className="suggestion-card-title">
                    {suggestion.name || `לוק ${index + 1}`}
                  </h2>
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

