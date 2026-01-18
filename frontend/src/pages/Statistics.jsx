import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Shirt, Heart, Droplet, Package } from 'lucide-react';
import Layout from '../components/Layout';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/closet/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('שגיאה בטעינת הנתונים');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  const CategoryBar = ({ category, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-gray-700 font-medium">{category}</span>
          <span className="text-gray-600">{count} פריטים</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const ColorDot = ({ color, count }) => (
    <div className="flex items-center gap-2 mb-2">
      <div
        className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
      <span className="text-gray-700 text-sm flex-1">{color}</span>
      <span className="text-gray-600 font-medium">{count}</span>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">טוען נתונים סטטיסטיים...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchStatistics}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">סטטיסטיקות הארון</h1>
          </div>
          <p className="text-gray-600">סקירה מפורטת של הפריטים שלך</p>
        </header>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            title="סה״כ פריטים"
            value={stats?.totalItems || 0}
            color="bg-indigo-500"
          />
          <StatCard
            icon={Shirt}
            title="פריטים זמינים"
            value={stats?.availableItems || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={Droplet}
            title="בכביסה"
            value={stats?.inLaundryCount || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={Heart}
            title="פריטים מועדפים"
            value={stats?.favoriteItemsCount || 0}
            color="bg-pink-500"
          />
        </div>

        {/* Outfit Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              לוקים
            </h3>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-700">סה״כ לוקים:</span>
                <span className="font-bold text-gray-800">{stats?.outfitsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">לוקים מועדפים:</span>
                <span className="font-bold text-gray-800">{stats?.favoriteOutfitsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-indigo-600" />
            פילוח לפי קטגוריה
          </h3>
          {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <CategoryBar
                    key={category}
                    category={category}
                    count={count}
                    total={stats.totalItems}
                  />
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">אין נתונים זמינים</p>
          )}
        </div>

        {/* Color and Season Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Colors */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">צבעים פופולריים</h3>
            {stats?.colorStats && stats.colorStats.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {stats.colorStats.slice(0, 10).map(({ color, count }) => (
                  <ColorDot key={color} color={color} count={count} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">אין נתונים זמינים</p>
            )}
          </div>

          {/* Seasons */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">עונות</h3>
            {stats?.seasonStats && Object.keys(stats.seasonStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.seasonStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([season, count]) => (
                    <div key={season} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{season}</span>
                      <span className="text-indigo-600 font-bold text-lg">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">אין נתונים זמינים</p>
            )}
          </div>
        </div>

        {/* Occasions */}
        {stats?.occasionStats && Object.keys(stats.occasionStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">אירועים</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.occasionStats)
                .sort(([, a], [, b]) => b - a)
                .map(([occasion, count]) => (
                  <div key={occasion} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
                    <p className="text-gray-700 font-medium mb-1">{occasion}</p>
                    <p className="text-2xl font-bold text-indigo-600">{count}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;
