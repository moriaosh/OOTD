import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditItemModal = ({ isOpen, onClose, item, onSave, availableTags }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    color: '',
    season: '',
    occasion: '',
    notes: '',
    tagIds: []
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        color: item.color || '',
        season: item.season || '',
        occasion: item.occasion || '',
        notes: item.notes || '',
        tagIds: item.tags ? item.tags.map(t => t.id) : []
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, formData);
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }));
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">ערוך פריט</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Preview */}
          <div className="text-center">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-lg mx-auto shadow-md"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם הפריט</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">בחר קטגוריה</option>
              <option value="חולצה">חולצה</option>
              <option value="מכנס">מכנס</option>
              <option value="שמלה">שמלה</option>
              <option value="נעל">נעל</option>
              <option value="ז'קט">ז'קט</option>
              <option value="מעיל">מעיל</option>
              <option value="חצאית">חצאית</option>
              <option value="אביזר">אביזר</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">צבע</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">בחר צבע</option>
              <option value="שחור">שחור</option>
              <option value="לבן">לבן</option>
              <option value="כחול">כחול</option>
              <option value="אדום">אדום</option>
              <option value="ירוק">ירוק</option>
              <option value="צהוב">צהוב</option>
              <option value="כתום">כתום</option>
              <option value="סגול">סגול</option>
              <option value="ורוד">ורוד</option>
              <option value="חום">חום</option>
              <option value="אפור">אפור</option>
              <option value="בז'">בז'</option>
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">עונה</label>
            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">כל העונות</option>
              <option value="קיץ">קיץ</option>
              <option value="חורף">חורף</option>
              <option value="אביב">אביב</option>
              <option value="סתיו">סתיו</option>
            </select>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אירוע</label>
            <select
              value={formData.occasion}
              onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">כל אירוע</option>
              <option value="יומי">יומי</option>
              <option value="ספורט">ספורט</option>
              <option value="רשמי">רשמי</option>
              <option value="מסיבה">מסיבה</option>
              <option value="עבודה">עבודה</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              placeholder="הוסף הערות..."
            />
          </div>

          {/* Tags */}
          {availableTags && availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">תגיות</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tagIds.includes(tag.id)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            >
              שמור שינויים
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
