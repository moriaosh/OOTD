import { useState } from 'react';
import { Upload, Loader2, ShoppingBag, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

const PurchaseAdvisor = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!imageUrl || !itemName || !itemType) {
      alert('אנא מלאי את כל השדות');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/purchase/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl, itemName, itemType })
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data);
      } else {
        setError(data.message || 'שגיאה בניתוח הקנייה');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('שגיאה בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 8) return '🎉';
    if (score >= 6) return '🤔';
    return '⚠️';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6" dir="rtl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">יועץ הקניות</h1>
          </div>
          <p className="text-gray-600 text-lg">
            העלי תמונה של פריט שאת שוקלת לקנות, ונבדוק עבורך עד כמה הוא מתאים לארון שלך 👗
          </p>
        </header>

        {/* Analysis Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleAnalyze} className="space-y-6">
            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קישור לתמונה *
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                העתיקי קישור לתמונה של הפריט (מהאתר של החנות, למשל)
              </p>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם הפריט *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="לדוגמה: חולצה כחולה"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג הפריט *
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">בחרי קטגוריה...</option>
                <option value="חולצה">חולצה</option>
                <option value="מכנס">מכנס</option>
                <option value="מכנסיים">מכנסיים</option>
                <option value="שמלה">שמלה</option>
                <option value="נעל">נעל</option>
                <option value="נעליים">נעליים</option>
                <option value="ז'קט">ז'קט</option>
                <option value="מעיל">מעיל</option>
                <option value="חצאית">חצאית</option>
                <option value="אביזר">אביזר</option>
              </select>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">תצוגה מקדימה:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-sm max-h-64 mx-auto rounded-lg shadow-md object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  מנתח...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  נתח התאמה לארון
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">שגיאה:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              תוצאות הניתוח
            </h2>

            {/* Score Display */}
            <div className="text-center mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-6xl">{getScoreEmoji(analysis.score)}</span>
                <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/10
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium">ציון התאמה</p>
            </div>

            {/* Explanation */}
            <div className="mb-6 p-6 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">הסבר:</h3>
                  <p className="text-gray-700 leading-relaxed">{analysis.explanation}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysis.recommendations && (
              <div className="mb-6 p-6 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">המלצות:</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.recommendations}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {analysis.warnings && (
              <div className="p-6 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">שימי לב:</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.warnings}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Closet Size Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              הניתוח מבוסס על {analysis.closetSize} פריטים בארון שלך
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseAdvisor;
