import { useState, useEffect } from 'react';
import { X, Loader2, Tag as TagIcon } from 'lucide-react';
import { closetAPI, tagsAPI } from '../services/api';

const CATEGORIES = ['חולצה', 'מכנסיים', 'שמלה', 'נעל', 'מעיל', 'אביזר'];
const COLORS = ['שחור', 'לבן', 'אפור', 'כחול', 'אדום', 'ירוק', 'צהוב', 'ורוד', 'סגול', 'חום'];
const SEASONS = ['קיץ', 'חורף', 'אביב', 'סתיו', 'כל העונות'];
const OCCASIONS = ['יומיומי', 'עבודה', 'אירוע', 'אלגנטי'];

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    color: COLORS[0],
    season: SEASONS[0],
    occasion: OCCASIONS[0],
    notes: '',
    image: null,
    selectedTags: [],
  });
  const [tags, setTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        category: CATEGORIES[0],
        color: COLORS[0],
        season: SEASONS[0],
        occasion: OCCASIONS[0],
        notes: '',
        image: null,
        selectedTags: [],
      });
      setImagePreview(null);
      setError(null);
      setMessage(null);
      fetchTags();
    }
  }, [isOpen]);

  const fetchTags = async () => {
    try {
      const data = await tagsAPI.getTags();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setMessage(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setError('אנא בחר/י תמונה.');
      return;
    }
    if (!formData.name || !formData.category || !formData.color) {
      setError('יש למלא את שדות השם, קטגוריה וצבע.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('category', formData.category);
    dataToSend.append('color', formData.color);
    dataToSend.append('season', formData.season);
    dataToSend.append('occasion', formData.occasion);
    dataToSend.append('notes', formData.notes);
    dataToSend.append('image', formData.image);
    if (formData.selectedTags.length > 0) {
      dataToSend.append('tagIds', JSON.stringify(formData.selectedTags));
    }

    try {
      const result = await closetAPI.addItem(dataToSend);
      onUploadSuccess(result.item);
      setMessage('העלאה הצליחה!');
      setTimeout(() => {
        onClose();
      }, 1000);
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4" dir="rtl">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">שם הפריט:</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
            />
          </label>

          <div className="flex space-x-4 space-x-reverse">
            <label className="block w-1/2">
              <span className="text-sm font-medium text-gray-700">קטגוריה:</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-1/2">
              <span className="text-sm font-medium text-gray-700">צבע מרכזי:</span>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex space-x-4 space-x-reverse">
            <label className="block w-1/2">
              <span className="text-sm font-medium text-gray-700">עונה:</span>
              <select
                name="season"
                value={formData.season}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-1/2">
              <span className="text-sm font-medium text-gray-700">סוג אירוע:</span>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
              >
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">הערות (אופציונלי):</span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="הערות על הבגד, טיפים לשילובים וכו'"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">תמונת הבגד:</span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </label>

          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* Tags Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="w-4 h-4 inline ml-1" />
              תגיות (אופציונלי)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-300 rounded-lg">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    formData.selectedTags.includes(tag.id)
                      ? 'bg-indigo-600 text-white'
                      : tag.userId === null
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">אין תגיות זמינות</p>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm p-2 bg-green-100 rounded-lg">{message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg shadow-lg text-base font-medium text-white transition duration-150 ease-in-out ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500/50'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                מעלה לארון...
              </span>
            ) : (
              'שמירת הבגד בארון'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

