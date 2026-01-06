import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Minus, Check, AlertCircle, Plane, Calendar, MapPin, Activity, Backpack, RefreshCw, Clock } from 'lucide-react';

// Cache keys - NO EXPIRATION! Save tokens by keeping trip suggestions until manual refresh
const CACHE_KEYS = {
  PACKING_LIST: 'ootd_cached_packing_list',
  TRIP_DATA: 'ootd_cached_trip_data',
  FORM_DATA: 'ootd_trip_form_data',
  QUANTITIES: 'ootd_trip_quantities',
  TIMESTAMP: 'ootd_trip_timestamp'
};

const TripPlannerModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('form'); // 'form' | 'loading' | 'result'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [packingStyle, setPackingStyle] = useState('Standard');

  // Result state
  const [packingList, setPackingList] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});

  // Cache state
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);

  const availableActivities = [
    { id: 'hiking', label: 'הליכה/טיול', icon: '🥾' },
    { id: 'beach', label: 'חוף', icon: '🏖️' },
    { id: 'nightout', label: 'יציאה לילית', icon: '🌃' },
    { id: 'business', label: 'עסקים', icon: '💼' },
    { id: 'casual', label: 'יומיומי', icon: '👕' },
    { id: 'formal', label: 'רשמי', icon: '👔' },
    { id: 'sports', label: 'ספורט', icon: '⚽' },
    { id: 'swimming', label: 'שחייה', icon: '🏊' }
  ];

  const packingStyles = [
    { value: 'Minimalist', label: 'מינימליסטי', description: 'מינימום פריטים, מקסימום שילובים' },
    { value: 'Standard', label: 'סטנדרטי', description: 'כמות מאוזנת, כולל עתודות' },
    { value: 'Extended', label: 'מורחב', description: 'יותר אופציות וגיוון' }
  ];

  // Format cache timestamp for display
  const formatCacheTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'עכשיו';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return new Date(timestamp).toLocaleDateString('he-IL');
  };

  // Check if cache exists (NO time limit - save tokens!)
  const isCacheValid = () => {
    const cachedPackingList = localStorage.getItem(CACHE_KEYS.PACKING_LIST);
    return !!cachedPackingList;
  };

  // Load from cache
  const loadFromCache = () => {
    try {
      const cachedPackingList = localStorage.getItem(CACHE_KEYS.PACKING_LIST);
      const cachedTripData = localStorage.getItem(CACHE_KEYS.TRIP_DATA);
      const cachedFormData = localStorage.getItem(CACHE_KEYS.FORM_DATA);
      const cachedQuantities = localStorage.getItem(CACHE_KEYS.QUANTITIES);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);

      if (cachedPackingList && isCacheValid()) {
        setPackingList(JSON.parse(cachedPackingList));
        setTripData(JSON.parse(cachedTripData));
        setItemQuantities(JSON.parse(cachedQuantities));

        const formData = JSON.parse(cachedFormData);
        setDestination(formData.destination);
        setStartDate(formData.startDate);
        setEndDate(formData.endDate);
        setActivities(formData.activities);
        setPackingStyle(formData.packingStyle);

        setIsFromCache(true);
        setCacheTimestamp(timestamp ? parseInt(timestamp) : null);
        setStep('result');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading cache:', err);
      return false;
    }
  };

  // Save to cache
  const saveToCache = (packingListData, tripDataObj, formData, quantities) => {
    try {
      localStorage.setItem(CACHE_KEYS.PACKING_LIST, JSON.stringify(packingListData));
      localStorage.setItem(CACHE_KEYS.TRIP_DATA, JSON.stringify(tripDataObj));
      localStorage.setItem(CACHE_KEYS.FORM_DATA, JSON.stringify(formData));
      localStorage.setItem(CACHE_KEYS.QUANTITIES, JSON.stringify(quantities));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (err) {
      console.error('Error saving cache:', err);
    }
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEYS.PACKING_LIST);
      localStorage.removeItem(CACHE_KEYS.TRIP_DATA);
      localStorage.removeItem(CACHE_KEYS.FORM_DATA);
      localStorage.removeItem(CACHE_KEYS.QUANTITIES);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  };

  // Load from cache when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFromCache();
    }
  }, [isOpen]);

  const toggleActivity = (activityId) => {
    setActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(a => a !== activityId)
        : [...prev, activityId]
    );
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const handleGenerate = async () => {
    // Validation
    if (!destination.trim()) {
      setError('נא להזין יעד לטיול');
      return;
    }
    if (!startDate || !endDate) {
      setError('נא לבחור תאריכי טיול');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('תאריך הסיום חייב להיות אחרי תאריך ההתחלה');
      return;
    }
    if (activities.length === 0) {
      setError('נא לבחור לפחות פעילות אחת');
      return;
    }

    setError(null);
    setLoading(true);
    setStep('loading');

    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('http://localhost:5000/api/trips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          activities: activities.map(id => availableActivities.find(a => a.id === id)?.label).filter(Boolean),
          packingStyle
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'שגיאה ביצירת רשימת האריזה');
      }

      setPackingList(data.packingList);
      setTripData(data);

      // Initialize quantities
      const quantities = {};
      data.packingList.categories.forEach(cat => {
        cat.items.forEach(item => {
          quantities[`${cat.name}-${item.name}`] = item.quantity || 1;
        });
      });
      setItemQuantities(quantities);

      // Save to cache
      const formData = { destination, startDate, endDate, activities, packingStyle };
      saveToCache(data.packingList, data, formData, quantities);
      setIsFromCache(false);
      setCacheTimestamp(Date.now());

      setStep('result');
    } catch (err) {
      console.error('Generate packing list error:', err);
      setError(err.message);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (categoryName, itemName, delta) => {
    const key = `${categoryName}-${itemName}`;
    setItemQuantities(prev => ({
      ...prev,
      [key]: Math.max(1, (prev[key] || 1) + delta)
    }));
  };

  const resetModal = () => {
    setStep('form');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setActivities([]);
    setPackingStyle('Standard');
    setPackingList(null);
    setTripData(null);
    setError(null);
    setIsFromCache(false);
    setCacheTimestamp(null);
    clearCache();
  };

  const handleRefresh = () => {
    if (!loading) {
      setIsFromCache(false);
      handleGenerate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-20">
        {/* Header */}
        <div className="flex top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 pt-60 pb-6 px-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">
                {step === 'form' ? 'תכנון טיול חכם' : 'רשימת האריזה שלי'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Form Step */}
          {step === 'form' && (
            <div className="space-y-6">
              {/* Destination */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  יעד הטיול
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="לאן את טסה? (למשל: פריז, אילת, ניו יורק)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    תאריך התחלה
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    תאריך סיום
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {startDate && endDate && calculateDuration() > 0 && (
                <div className="p-3 bg-indigo-50 rounded-lg text-center">
                  <span className="text-indigo-700 font-semibold">
                    משך הטיול: {calculateDuration()} ימים
                  </span>
                </div>
              )}

              {/* Activities */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Activity className="w-4 h-4" />
                  פעילויות מתוכננות (בחרי לפחות אחת)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {availableActivities.map(activity => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        activities.includes(activity.id)
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{activity.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{activity.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Packing Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Backpack className="w-4 h-4" />
                  סגנון אריזה
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {packingStyles.map(style => (
                    <button
                      key={style.value}
                      onClick={() => setPackingStyle(style.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-right ${
                        packingStyle === style.value
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-bold text-gray-800 mb-1">{style.label}</div>
                      <div className="text-xs text-gray-600">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מייצר רשימה...
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5" />
                    צרי לי רשימת אריזה!
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">מייצר רשימת אריזה מותאמת אישית...</h3>
              <p className="text-gray-600">
                הבינה המלאכותית שלנו בודקת את הארון שלך, מזג האוויר ביעד, והפעילויות שתעשי 🤖✨
              </p>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && packingList && (
            <div className="space-y-6">
              {/* Cache Info & Refresh */}
              <div className="flex items-center justify-between gap-3">
                {isFromCache && cacheTimestamp && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1" title={new Date(cacheTimestamp).toLocaleString('he-IL')}>
                    <Clock className="w-3 h-3" />
                    נשמר {formatCacheTime(cacheTimestamp)}
                  </span>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="mr-auto px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
                  title="רענן רשימת אריזה"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  רענן
                </button>
              </div>

              {/* Trip Summary */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-indigo-900 mb-2">
                  {destination} | {tripData?.duration} ימים
                </h3>
                {tripData?.weatherData && (
                  <p className="text-sm text-indigo-700">
                    🌤️ מזג אוויר צפוי: {tripData.weatherData.temperature}°C, {tripData.weatherData.description}
                  </p>
                )}
              </div>

              {/* Packing List Categories */}
              {packingList.categories.map((category, catIdx) => (
                <div key={catIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800">{category.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{category.items.length} פריטים</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {category.items.map((item, itemIdx) => {
                      const quantityKey = `${category.name}-${item.name}`;
                      const currentQuantity = itemQuantities[quantityKey] || item.quantity || 1;

                      return (
                        <div
                          key={itemIdx}
                          className={`p-4 ${
                            item.isOwned ? 'bg-white' : 'bg-yellow-50 border-r-4 border-yellow-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {item.isOwned && (
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                                <span className={`font-medium ${item.isOwned ? 'text-gray-800' : 'text-yellow-800'}`}>
                                  {item.name}
                                </span>
                              </div>
                              {!item.isOwned && item.suggestion && (
                                <p className="text-xs text-yellow-700 mb-1">
                                  💡 {item.suggestion}
                                </p>
                              )}
                              {item.reason && (
                                <p className="text-xs text-gray-600">
                                  {item.reason}
                                </p>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(category.name, item.name, -1)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-semibold text-gray-800">
                                {currentQuantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(category.name, item.name, 1)}
                                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Tips */}
              {packingList.tips && packingList.tips.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">💡 טיפים לאריזה:</h4>
                  <ul className="space-y-1">
                    {packingList.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-blue-800">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  צור רשימה חדשה
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  סגור
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlannerModal;
