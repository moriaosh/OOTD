import React, { useState, useEffect } from 'react';
// נניח ש-axios מותקן בפרויקט ה-React שלך (אם לא, אפשר להחליף ב-fetch)
// import axios from 'axios'; 
import { Search, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';

// כתובת ה-API לשליפת הפריטים
const API_URL = 'http://localhost:5000/api/closet/my-items';

// נניח שזה הטוקן שהתקבל מה-Login. בפרויקט האמיתי, זה צריך לבוא מהקונטקסט או ה-localStorage.
// נשתמש בטוקן דמה חוקי כדי שהקוד יוכל להתחיל לעבוד, אבל יש לשנות אותו לטוקן אמיתי.
const MOCK_TOKEN = 'YOUR_ACTUAL_JWT_TOKEN_HERE'; 

// קומפוננטה להצגת פריט יחיד בארון
const ClosetItem = ({ item }) => {
  const { name, category, color, imageUrl } = item;

  // פונקציה לבדיקת תקינות תמונה (להחלפת תמונה שבורה בפלייס-הולדר)
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] border border-gray-100 flex flex-col">
      <div className="w-full h-48 sm:h-64 bg-gray-200 relative">
        {imageError || !imageUrl ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col p-4 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <span className="text-xs font-semibold">תמונה לא זמינה</span>
            <span className="text-[10px] text-gray-400 mt-1">{category}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="text-lg font-bold text-gray-800 truncate" title={name}>{name}</h3>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{category}</span>
          <span className="text-gray-500 text-xs">צבע: {color}</span>
        </div>
      </div>
    </div>
  );
};

// הקומפוננטה הראשית שמבצעת את השליפה ומציגה את הרשת
const App = () => {
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(MOCK_TOKEN); // בפועל, זה יגיע מ-Auth Context

  // פונקציה לשליפת הנתונים מה-Backend
  const fetchClosetItems = async () => {
    if (!token || token === 'YOUR_ACTUAL_JWT_TOKEN_HERE') {
        setError('שגיאה: טוקן אימות חסר. אנא התחברו או ספקו טוקן.');
        setLoading(false);
        return;
    }

    try {
      // הדמיית קריאת fetch (ניתן להחליף ב-axios)
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // שליחת הטוקן
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // אם השרת החזיר שגיאה (כגון 403 Forbidden)
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בשליפת נתונים');
      }

      const data = await response.json();
      setClosetItems(data);
      setError(null);

    } catch (err) {
      console.error("שגיאה בשליפת פריטים:", err);
      setError('שגיאה בשליפת הארון: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // הפעלת שליפת הנתונים בפעם הראשונה שהקומפוננטה עולה
  useEffect(() => {
    fetchClosetItems();
  }, [token]); // תופעל שוב אם הטוקן משתנה

  const refreshItems = () => {
    setLoading(true);
    fetchClosetItems();
  }

  // --- מצבי טעינה ושגיאה ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="mr-3 text-lg font-medium text-gray-700">טוען ארון...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg m-8">
        <h2 className="text-xl font-bold mb-2">שגיאת מערכת</h2>
        <p>{error}</p>
        <button 
            onClick={refreshItems}
            className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150">
                נסה שוב
        </button>
      </div>
    );
  }

  // --- רנדור ראשי ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">
          הארון שלי
        </h1>
        <div className="flex space-x-2 space-x-reverse">
          {/* כפתור הוספת פריט (Task 9) */}
          <button className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150">
            <PlusCircle className="w-5 h-5 ml-2" />
            הוסף פריט
          </button>
          {/* כפתור חיפוש/סינון */}
          <button className="flex items-center bg-white text-gray-600 font-semibold py-2 px-4 rounded-full shadow-lg border border-gray-300 hover:bg-gray-100 transition duration-150">
            <Search className="w-5 h-5 ml-2" />
            סנן
          </button>
        </div>
      </header>

      {/* תצוגת פריטים */}
      {closetItems.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600">אין עדיין פריטים בארון.</p>
          <p className="text-gray-500 mt-2">לחצו על "הוסף פריט" כדי להתחיל לבנות את הארון שלכם.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {closetItems.map((item, index) => (
            <ClosetItem key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;