import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, AlertCircle, Loader2, X } from 'lucide-react'; // הוספת X ו-Loader

// הגדרת ה-API כמשתנה קבוע
const API_URL = 'http://localhost:5000/api/closet/my-items'; 
const UPLOAD_URL = 'http://localhost:5000/api/closet/add-item'; // נתיב ההעלאה

// נניח שזה הטוקן שהתקבל מה-Login.
const MOCK_TOKEN = 'YOUR_ACTUAL_JWT_TOKEN_HERE'; 

// --- הגדרות קטגוריות וצבעים (Task 9) ---
const CATEGORIES = ['חולצה', 'מכנסיים', 'שמלה', 'נעל', 'מעיל', 'אביזר'];
const COLORS = ['שחור', 'לבן', 'אפור', 'כחול', 'אדום', 'ירוק', 'צהוב', 'ורוד', 'סגול', 'חום'];
const SEASONS = ['קיץ', 'חורף', 'אביב', 'סתיו', 'כל העונות'];
const OCCASIONS = ['יומיומי', 'עבודה', 'אירוע', 'אלגנטי'];

// --- רכיב טופס ההעלאה וה Modal (Task 9 & 11) ---
const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    // בפרויקט אמיתי: הטוקן ייקרא מ-localStorage
    const authToken = localStorage.getItem('ootd_authToken') || MOCK_TOKEN;

    const [formData, setFormData] = useState({
        name: '',
        category: CATEGORIES[0],
        color: COLORS[0],
        season: SEASONS[0], 
        occasion: OCCASIONS[0], 
        notes: '', 
        image: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // איפוס טופס בעת פתיחה
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', category: CATEGORIES[0], color: COLORS[0], season: SEASONS[0], occasion: OCCASIONS[0], notes: '', image: null });
            setError(null);
            setMessage(null);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setMessage(null);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.image) { setError('אנא בחר/י תמונה.'); return; }
        // ודא שגם שדות הטקסט הקריטיים מולאו
        if (!formData.name || !formData.category || !formData.color) { setError('יש למלא את שדות השם, קטגוריה וצבע.'); return; }
        
        if (!authToken || authToken === MOCK_TOKEN) { setError('אימות נכשל. הטוקן חסר.'); return; }

        setIsLoading(true);
        setError(null);

        // Task 9: יצירת אובייקט FormData לשליחת קובץ וטקסט יחד
        const dataToSend = new FormData();
        dataToSend.append('name', formData.name);
        dataToSend.append('category', formData.category);
        dataToSend.append('color', formData.color);
        dataToSend.append('season', formData.season);
        dataToSend.append('occasion', formData.occasion);
        dataToSend.append('notes', formData.notes);
        dataToSend.append('image', formData.image); 

        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: dataToSend, 
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('אימות נכשל. אנא התחברו מחדש.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'שגיאת שרת: פריט לא הועלה.');
            }

            const result = await response.json();
            onUploadSuccess(result.item); 
            setMessage("העלאה הצליחה!");
            setTimeout(onClose, 1000); // סגור לאחר הצלחה

        } catch (err) {
            console.error('Upload Failed:', err);
            setError(err.message || 'שגיאה כללית בהעלאה.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-200" dir="rtl">
                    <h2 className="text-2xl font-bold text-gray-800">העלאת פריט חדש</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* טופס ההעלאה המלא */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4" dir="rtl">
                    {/* שדות הטופס */}
                    <label className="block"><span className="text-sm font-medium text-gray-700">שם הפריט:</span>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border" />
                    </label>

                    <div className="flex space-x-4 space-x-reverse">
                        <label className="block w-1/2"><span className="text-sm font-medium text-gray-700">קטגוריה:</span>
                            <select name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border">
                                {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </label>
                        <label className="block w-1/2"><span className="text-sm font-medium text-gray-700">צבע מרכזי:</span>
                            <select name="color" value={formData.color} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border">
                                {COLORS.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </label>
                    </div>

                    <div className="flex space-x-4 space-x-reverse">
                        <label className="block w-1/2"><span className="text-sm font-medium text-gray-700">עונה:</span>
                            <select name="season" value={formData.season} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border">
                                {SEASONS.map(s => (<option key={s} value={s}>{s}</option>))}
                            </select>
                        </label>
                        <label className="block w-1/2"><span className="text-sm font-medium text-gray-700">סוג אירוע:</span>
                            <select name="occasion" value={formData.occasion} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border">
                                {OCCASIONS.map(o => (<option key={o} value={o}>{o}</option>))}
                            </select>
                        </label>
                    </div>

                    <label className="block"><span className="text-sm font-medium text-gray-700">הערות (אופציונלי):</span>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" placeholder="הערות על הבגד, טיפים לשילובים וכו'" className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border" />
                    </label>

                    <label className="block"><span className="text-sm font-medium text-gray-700">תמונת הבגד:</span>
                        <input type="file" name="image" accept="image/*" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </label>
                    
                    {/* הודעות סטאטוס */}
                    {error && <p className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">{error}</p>}
                    {message && <p className="text-green-600 text-sm p-2 bg-green-100 rounded-lg">{message}</p>}
                    
                    {/* כפתור שליחה */}
                    <button
                        type="submit"
                        disabled={isLoading || !authToken}
                        className={`w-full py-3 px-4 rounded-lg shadow-lg text-base font-medium text-white transition duration-150 ease-in-out ${
                          isLoading || !authToken ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500/50'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                מעלה לארון...
                            </span>
                        ) : 'שמירת הבגד בארון'}
                    </button>
                </form>
            </div>
        </div>
    );
};
// --- סוף רכיב ה-Modal ---


// קומפוננטה להצגת פריט יחיד בארון
const ClosetItem = ({ item }) => {
  const { name, category, color, imageUrl } = item;
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
      
      <div className="p-4 flex-grow flex flex-col justify-between" dir="rtl">
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
    const [isModalOpen, setIsModalOpen] = useState(false); // מצב לניהול ה-Modal
    
    // בפרויקט אמיתי: הטוקן ייקרא מ-localStorage
    const currentToken = localStorage.getItem('ootd_authToken') || MOCK_TOKEN; 

    // פונקציה לשליפת הנתונים מה-Backend (Task 15)
    const fetchClosetItems = async () => {
        // קריאת הטוקן המעודכנת מה-localStorage
        const currentToken = localStorage.getItem('ootd_authToken');

        if (!currentToken || currentToken === MOCK_TOKEN) {
            // אם הטוקן הוא עדיין טוקן הדמה, אל תנסה לשלוף
            setError('שגיאה: טוקן אימות חסר. אנא התחברו.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
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

    // פונקציית קריאה חוזרת לאחר העלאה מוצלחת (Task 9)
    const handleUploadSuccess = (newItem) => {
        // הוספת הפריט החדש לראש הרשימה וסגירת Modal
        setClosetItems(prevItems => [newItem, ...prevItems]);
        setIsModalOpen(false); 
    };

    // הפעלת שליפת הנתונים בפעם הראשונה שהקומפוננטה עולה
    useEffect(() => {
        // קריאה חוזרת ל-fetch כאשר ה-App נטען
        fetchClosetItems(); 
    }, []); // ללא תלות ב-token, מכיוון שהטוקן נקרא מ-localStorage בתוך הפונקציה.

    const refreshItems = () => {
        setLoading(true);
        fetchClosetItems();
    }

    // --- רנדור ראשי ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']" dir="rtl">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">
                    הארון שלי
                </h1>
                <div className="flex space-x-2 space-x-reverse">
                    {/* כפתור הוספת פריט (פתיחת ה-Modal) */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150">
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

            {/* הודעות סטאטוס */}
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 ml-3" /> טוען ארון...
                </div>
            )}
            {error && (
                <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-8">
                    <p>{error}</p>
                    <button onClick={refreshItems} className="mt-2 text-sm underline">נסה שוב</button>
                </div>
            )}

            {/* תצוגת פריטים */}
            {!loading && !error && closetItems.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">אין עדיין פריטים בארון.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {closetItems.map((item) => (
                        <ClosetItem key={item.id} item={item} />
                    ))}
                </div>
            )}

            {/* ה-Modal של ההעלאה (שמשתמש ב-UploadForm) */}
            <UploadModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

// ודאי שזהו הייצוא הראשי של הקובץ
export default App;