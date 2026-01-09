import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, PlusCircle, Sparkles } from 'lucide-react';
import { closetAPI } from '../services/api';
import Layout from '../components/Layout';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const WeeklyPlanner = () => {
  const [plan, setPlan] = useState({});
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch closet items
  useEffect(() => {
    const fetchItems = async () => {
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

    fetchItems();
  }, []);

  // Load saved weekly plan
  useEffect(() => {
    const loadWeeklyPlan = async () => {
      try {
        const token = localStorage.getItem('ootd_authToken');
        if (!token) return;

        // Get the start of current week (Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - dayOfWeek);
        sunday.setHours(0, 0, 0, 0);

        const response = await fetch(`http://localhost:5000/api/weekly?date=${sunday.toISOString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            // Parse JSON strings to arrays if needed
            const parsePlanData = (dayData) => {
              if (!dayData) return null;
              if (Array.isArray(dayData)) return dayData;
              if (typeof dayData === 'string') {
                try {
                  const parsed = JSON.parse(dayData);
                  return Array.isArray(parsed) ? parsed : [dayData];
                } catch {
                  return [dayData];
                }
              }
              return [dayData];
            };

            setPlan({
              sunday: parsePlanData(data.sunday),
              monday: parsePlanData(data.monday),
              tuesday: parsePlanData(data.tuesday),
              wednesday: parsePlanData(data.wednesday),
              thursday: parsePlanData(data.thursday),
              friday: parsePlanData(data.friday),
              saturday: parsePlanData(data.saturday)
            });
          }
        }
      } catch (err) {
        console.error('Error loading weekly plan:', err);
      }
    };

    loadWeeklyPlan();
  }, []);

  const handleSelectOutfit = (itemId) => {
    // Add item to the day's array (allow multiple items)
    const currentItems = plan[selectedDay] || [];
    if (!currentItems.includes(itemId)) {
      setPlan({ ...plan, [selectedDay]: [...currentItems, itemId] });
    }
    setIsModalOpen(false);
  };

  const removeOutfit = (day) => {
    const newPlan = { ...plan };
    delete newPlan[day];
    setPlan(newPlan);
  };

  const removeItem = (day, itemId) => {
    const currentItems = plan[day] || [];
    const updatedItems = currentItems.filter(id => id !== itemId);
    if (updatedItems.length === 0) {
      const newPlan = { ...plan };
      delete newPlan[day];
      setPlan(newPlan);
    } else {
      setPlan({ ...plan, [day]: updatedItems });
    }
  };

  const savePlan = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('ootd_authToken');
      if (!token) return;

      // Get the start of current week (Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      sunday.setHours(0, 0, 0, 0);

      // Convert arrays to JSON strings for database storage
      const daysToSave = {};
      DAYS.forEach(day => {
        if (plan[day] && Array.isArray(plan[day]) && plan[day].length > 0) {
          daysToSave[day] = JSON.stringify(plan[day]);
        } else if (plan[day]) {
          daysToSave[day] = plan[day];
        }
      });

      await fetch('http://localhost:5000/api/weekly/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: sunday.toISOString(),
          days: daysToSave
        })
      });

      alert('התכנון השבועי נשמר בהצלחה! ✅');
    } catch (err) {
      console.error('Error saving plan:', err);
      alert('שגיאה בשמירת התכנון');
    } finally {
      setSaving(false);
    }
  };

  const getItemById = (itemId) => {
    return closetItems.find(item => item.id === itemId);
  };

  const getItemsForDay = (day) => {
    const itemIds = plan[day];
    if (!itemIds) return [];
    if (Array.isArray(itemIds)) {
      return itemIds.map(id => getItemById(id)).filter(Boolean);
    }
    // Support old single-item format
    const item = getItemById(itemIds);
    return item ? [item] : [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700">טוען...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8 pt-32" dir="rtl">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">תכנון שבועי</h1>
                <p className="text-gray-600 mt-1">תכנני את הלוקים שלך לשבוע הקרוב</p>
              </div>
            </div>
            <button
              onClick={savePlan}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  שמור תכנון
                </>
              )}
            </button>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DAYS.map((day, index) => {
              const items = getItemsForDay(day);
              const hasItems = items.length > 0;

              return (
                <div
                  key={day}
                  className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-indigo-300 transition-all overflow-hidden flex flex-col"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 text-center">
                    <h3 className="font-bold text-white">{HEBREW_DAYS[index]}</h3>
                    {hasItems && (
                      <span className="text-xs text-white/80">{items.length} פריטים</span>
                    )}
                  </div>

                  {/* Outfit Display */}
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    {hasItems ? (
                      <>
                        {/* Display all items */}
                        <div className="flex-1 space-y-2 max-h-64 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="relative group">
                              <div className="w-full h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                onClick={() => removeItem(day, item.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-xs mt-1 font-medium text-center truncate text-gray-700">
                                {item.name}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Add more button */}
                        <button
                          onClick={() => {
                            setSelectedDay(day);
                            setIsModalOpen(true);
                          }}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-400 transition-all text-xs font-medium gap-1"
                        >
                          <PlusCircle className="w-4 h-4" />
                          הוסף עוד
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedDay(day);
                          setIsModalOpen(true);
                        }}
                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-400 transition-all group"
                      >
                        <PlusCircle className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">בחרי לבוש</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {closetItems.length === 0 && (
            <div className="mt-8 text-center p-8 bg-white rounded-xl shadow-lg">
              <p className="text-gray-600">אין פריטים בארון. הוסיפי פריטים כדי להתחיל לתכנן!</p>
            </div>
          )}
        </div>

        {/* Selection Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 pt-36 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[75vh] overflow-hidden flex flex-col my-auto">
              {/* Modal Header */}
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-2xl font-bold text-gray-800">
                  בחרי פריט ליום {HEBREW_DAYS[DAYS.indexOf(selectedDay)]}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {closetItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectOutfit(item.id)}
                      className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all group"
                    >
                      <div className="h-32 sm:h-40 overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WeeklyPlanner;
