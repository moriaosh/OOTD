import { useState } from 'react';
import { X, Edit2, Trash2, Globe, Lock, Save, X as XIcon } from 'lucide-react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetailModal = ({ post, isOpen, onClose, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || '');
  const [editedIsPublic, setEditedIsPublic] = useState(post?.isPublic || false);
  const [error, setError] = useState(null);

  const isOwner = user && post && (user.id === post.userId || (post.user && user.id === post.user.id));

  const handleEdit = () => {
    setEditedCaption(post.caption);
    setEditedIsPublic(post.isPublic);
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCaption(post.caption);
    setEditedIsPublic(post.isPublic);
    setError(null);
  };

  const handleSave = async () => {
    if (!editedCaption.trim()) {
      setError('אנא הזן/י כיתוב לפרסום.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedPost = await postsAPI.updatePost(post.id, editedCaption.trim(), editedIsPublic);
      setIsEditing(false);
      if (onPostUpdated) {
        onPostUpdated(updatedPost.post);
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message || 'שגיאה בעדכון הפרסום.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('האם את בטוחה שברצונך למחוק פרסום זה? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await postsAPI.deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      onClose();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message || 'שגיאה במחיקת הפרסום.');
      setIsDeleting(false);
    }
  };

  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    return 'משתמש';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !post) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" 
      dir="rtl"
      style={{ zIndex: 10000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (!isEditing && !isSaving) {
            onClose();
          }
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">פרטי הפרסום</h2>
            {isOwner && !isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="ערוך"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="מחק"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isEditing || isSaving}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          <div className="mb-6">
            <div className="relative w-full" style={{ paddingTop: '100%' }}>
              <img
                src={post.imageUrl}
                alt={post.caption || 'פרסום'}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%239ca3af"%3Eתמונה לא זמינה%3C/text%3E%3C/svg%3E';
                }}
              />
              {/* Privacy indicator */}
              <div className="absolute top-4 left-4">
                {post.isPublic ? (
                  <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    ציבורי
                  </div>
                ) : (
                  <div className="bg-gray-600 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    פרטי
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Caption - Edit or View */}
          <div className="mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    כיתוב *
                  </label>
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    dir="rtl"
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editedIsPublic}
                    onChange={(e) => setEditedIsPublic(e.target.checked)}
                    disabled={isSaving}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                    שתף בפיד הציבורי
                  </label>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editedCaption.trim()}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        שמור שינויים
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XIcon className="w-5 h-5" />
                    ביטול
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-800 leading-relaxed mb-4">{post.caption}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <span className="font-semibold text-indigo-600">
                    {getUserDisplayName(post.user)}
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;

