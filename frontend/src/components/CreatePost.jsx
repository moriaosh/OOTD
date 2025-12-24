import { useState } from 'react';
import { X, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { postsAPI } from '../services/api';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
  const [formData, setFormData] = useState({
    image: null,
    caption: '',
    isPublic: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('אנא בחר/י קובץ תמונה בלבד.');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('גודל הקובץ גדול מדי. אנא בחר/י תמונה עד 5MB.');
        return;
      }
      setFormData({ ...formData, image: file });
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setError('אנא בחר/י תמונה.');
      return;
    }
    if (!formData.caption || formData.caption.trim() === '') {
      setError('אנא הזן/י כיתוב לפרסום.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const dataToSend = new FormData();
    dataToSend.append('image', formData.image);
    dataToSend.append('caption', formData.caption.trim());
    dataToSend.append('isPublic', formData.isPublic);

    try {
      const result = await postsAPI.createPost(dataToSend);
      setMessage('הפרסום נוצר בהצלחה!');
      
      // Reset form
      setFormData({
        image: null,
        caption: '',
        isPublic: false,
      });
      setImagePreview(null);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated(result.post);
      }
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Create Post Failed:', err);
      setError(err.message || 'שגיאה כללית ביצירת הפרסום.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        image: null,
        caption: '',
        isPublic: false,
      });
      setImagePreview(null);
      setError(null);
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" dir="rtl" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-800">צור פרסום חדש</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                תמונה *
              </label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="post-image-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="post-image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">
                      לחץ/י להעלאת תמונה
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      PNG, JPG עד 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    disabled={isLoading}
                    className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label htmlFor="caption" className="block text-sm font-semibold text-gray-700 mb-2">
                כיתוב *
              </label>
              <textarea
                id="caption"
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                placeholder="שתפי את המחשבות שלך על הלוק הזה..."
                rows={4}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50"
                dir="rtl"
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                disabled={isLoading}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                שתף בפיד הציבורי
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-4">
              {formData.isPublic 
                ? 'הפרסום יהיה גלוי לכל המשתמשים בפיד' 
                : 'הפרסום יהיה פרטי ויופיע רק בפרופיל שלך'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.image || !formData.caption.trim()}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מפרסם...
                  </>
                ) : (
                  'פרסם'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreatePost;

