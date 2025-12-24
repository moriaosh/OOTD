import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { tagsAPI } from '../services/api';

const TagManager = ({ isOpen, onClose }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagsAPI.getTags();
      setTags(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'שגיאה בטעינת התגיות');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const result = await tagsAPI.createTag(newTagName.trim());
      setTags([...tags, result.tag]);
      setNewTagName('');
      setError(null);
    } catch (err) {
      setError(err.message || 'שגיאה ביצירת התגית');
    }
  };

  const handleStartEdit = (tag) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
  };

  const handleUpdateTag = async (tagId) => {
    if (!editName.trim()) {
      setEditingTag(null);
      return;
    }

    try {
      const result = await tagsAPI.updateTag(tagId, editName.trim());
      setTags(tags.map(t => t.id === tagId ? result.tag : t));
      setEditingTag(null);
      setEditName('');
      setError(null);
    } catch (err) {
      setError(err.message || 'שגיאה בעדכון התגית');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('האם את בטוחה שברצונך למחוק תגית זו?')) return;

    try {
      await tagsAPI.deleteTag(tagId);
      setTags(tags.filter(t => t.id !== tagId));
      setError(null);
    } catch (err) {
      setError(err.message || 'שגיאה במחיקת התגית');
    }
  };

  const systemTags = tags.filter(t => t.userId === null);
  const userTags = tags.filter(t => t.userId !== null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 10000, paddingTop: '220px' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[calc(90vh-220px)] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TagIcon className="w-6 h-6" />
            ניהול תגיות
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Create New Tag */}
          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="שם תגית חדשה..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              הוסף תגית
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* System Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">תגיות מערכת</h3>
            <div className="flex flex-wrap gap-2">
              {systemTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* User Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">התגיות שלי</h3>
            {loading ? (
              <p className="text-gray-500">טוען...</p>
            ) : userTags.length === 0 ? (
              <p className="text-gray-500">אין תגיות מותאמות אישית</p>
            ) : (
              <div className="space-y-2">
                {userTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between bg-indigo-50 px-4 py-2 rounded-lg"
                  >
                    {editingTag === tag.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTag(tag.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          שמור
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-indigo-700 font-medium">{tag.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="text-indigo-600 hover:text-indigo-700 p-1"
                            title="ערוך"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="מחק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManager;


