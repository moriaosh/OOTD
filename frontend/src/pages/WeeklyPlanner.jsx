import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, PlusCircle, Sparkles, Check } from 'lucide-react';
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
    const currentItems = plan[selectedDay] || [];
    if (!currentItems.includes(itemId)) {
      setPlan({ ...plan, [selectedDay]: [...currentItems, itemId] });
    }
    setIsModalOpen(false);
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

      const today = new Date();
      const dayOfWeek = today.getDay();
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      sunday.setHours(0, 0, 0, 0);

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
    const item = getItemById(itemIds);
    return item ? [item] : [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">טוען...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 relative" dir="rtl">
        {/* Soft ambient background elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />

        {/* Content Container */}
        <div className="relative pt-40 pb-12 px-4 sm:px-8">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-12 relative z-20">
            <div className="flex items-center justify-between mb-6">
              {/* Title with soft styling */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-xl flex items-center justify-center border border-white/40 shadow-lg">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    התכנון השבועי שלי
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">בנייה חכמה של לוקים לשבוע</p>
                </div>
              </div>

              {/* Save Button - Glassmorphism */}
              <button
                onClick={savePlan}
                disabled={saving}
                className="group relative px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />

                <div className="relative flex items-center gap-2 text-white font-semibold">
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      שמור תכנון
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Weekly Grid - Fashion Slots */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
              {DAYS.map((day, index) => {
                const items = getItemsForDay(day);
                const hasItems = items.length > 0;
                const isToday = new Date().getDay() === index;

                return (
                  <DayCard
                    key={day}
                    day={day}
                    dayName={HEBREW_DAYS[index]}
                    items={items}
                    hasItems={hasItems}
                    isToday={isToday}
                    onAddItem={() => {
                      setSelectedDay(day);
                      setIsModalOpen(true);
                    }}
                    onRemoveItem={(itemId) => removeItem(day, itemId)}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {closetItems.length === 0 && (
              <div className="mt-12 text-center p-8 bg-white/60 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40">
                <p className="text-gray-600">אין פריטים בארון. הוסיפי פריטים כדי להתחיל לתכנן!</p>
              </div>
            )}
          </div>
        </div>

        {/* Selection Modal - Enhanced Glassmorphism */}
        {isModalOpen && (
          <SelectionModal
            selectedDay={selectedDay}
            dayName={HEBREW_DAYS[DAYS.indexOf(selectedDay)]}
            closetItems={closetItems}
            onSelect={handleSelectOutfit}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
};

// ==================== DAY CARD COMPONENT ====================
const DayCard = ({ day, dayName, items, hasItems, isToday, onAddItem, onRemoveItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative
        bg-white/40 backdrop-blur-xl
        rounded-3xl
        border border-white/60
        shadow-lg hover:shadow-2xl
        transition-all duration-500 ease-out
        overflow-hidden
        ${isHovered ? 'scale-105 -translate-y-2' : ''}
        ${isToday ? 'ring-2 ring-purple-400/50 ring-offset-2 ring-offset-purple-50' : ''}
      `}
    >
      {/* Ambient glow on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500 pointer-events-none`} />

      {/* Day Header - Soft gradient indicator */}
      <div className="relative p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`} />
            <h3 className="font-bold text-gray-800 text-lg">{dayName}</h3>
          </div>
          {hasItems && (
            <span className="px-2 py-1 text-xs font-semibold bg-purple-100/80 text-purple-700 rounded-full backdrop-blur-sm">
              {items.length}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-4">
        {hasItems ? (
          <div className="space-y-3">
            {/* Items Gallery - Mini Lookbook */}
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group/item relative bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-white/60 hover:border-purple-300 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {/* Item Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                      />
                      {/* Remove button overlay */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute inset-0 bg-red-500/0 group-hover/item:bg-red-500/90 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all duration-200"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Button - Subtle */}
            <button
              onClick={onAddItem}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60 transition-all duration-300 group/add"
            >
              <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-medium">
                <PlusCircle className="w-4 h-4 group-hover/add:rotate-90 transition-transform duration-300" />
                הוסף עוד
              </div>
            </button>
          </div>
        ) : (
          // Empty State - Elegant placeholder
          <button
            onClick={onAddItem}
            className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 bg-gradient-to-br from-purple-50/20 to-pink-50/20 hover:from-purple-50/40 hover:to-pink-50/40 transition-all duration-500 group/empty relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/0 via-pink-200/0 to-purple-200/0 group-hover/empty:from-purple-200/20 group-hover/empty:via-pink-200/20 group-hover/empty:to-purple-200/20 transition-all duration-700" />

            <div className="relative flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 flex items-center justify-center mb-3 group-hover/empty:scale-110 group-hover/empty:bg-purple-100/40 transition-all duration-500 shadow-lg">
                <PlusCircle className="w-8 h-8 text-purple-400 group-hover/empty:text-purple-600 group-hover/empty:rotate-90 transition-all duration-500" />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover/empty:text-purple-600 transition-colors">
                בחרי לבוש
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Today indicator badge */}
      {isToday && (
        <div className="absolute top-2 left-2">
          <div className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            היום
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SELECTION MODAL COMPONENT ====================
const SelectionModal = ({ selectedDay, dayName, closetItems, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-36 overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto">
        {/* Modal with glassmorphism */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/60 shadow-2xl">
          {/* Header */}
          <div className="relative p-6 border-b border-white/60 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 backdrop-blur-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  בחרי פריט ליום {dayName}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100/50 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {closetItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="group relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-white/80 hover:border-purple-400 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Info overlay */}
                  <div className="p-2 bg-white/80 backdrop-blur-sm">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 to-transparent group-hover:from-purple-500/20 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/60 bg-gray-50/50 backdrop-blur-sm">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-200/60 backdrop-blur-sm hover:bg-gray-300/60 text-gray-700 font-semibold rounded-xl transition-all duration-300"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
