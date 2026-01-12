import { useState } from 'react';
import { AlertCircle, Star, Edit2, Trash2, Loader } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

const ClosetItem = ({ item, onEdit, onDelete, onToggleLaundry }) => {
  const { id, name, category, color, imageUrl, tags = [], inLaundry } = item;
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit(item);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`למחוק את ${name}?`)) {
      onDelete && onDelete(id);
    }
  };

  const handleLaundryToggle = (e) => {
    e.stopPropagation();
    onToggleLaundry && onToggleLaundry(id);
  };

  return (
    <div className={`bg-white shadow-xl rounded-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] border border-gray-100 flex flex-col ${
      inLaundry ? 'opacity-60' : ''
    }`}>
      <div className="w-full h-48 sm:h-64 bg-gray-200 relative group">
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
            className={`w-full h-full object-cover ${inLaundry ? 'filter grayscale' : ''}`}
            onError={() => setImageError(true)}
          />
        )}

        {/* Laundry Overlay */}
        {inLaundry && (
          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
            <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-blue-600 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              בכביסה
            </div>
          </div>
        )}

        {/* Action Buttons - Show on hover */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Favorite Star Button */}
          <button
            onClick={handleFavoriteClick}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label={isFavorite(id) ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isFavorite(id)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-600'
              }`}
            />
          </button>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
            aria-label="ערוך פריט"
          >
            <Edit2 className="w-5 h-5 text-indigo-600" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-red-50 transition-colors"
            aria-label="מחק פריט"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>

          {/* Laundry Toggle Button */}
          <button
            onClick={handleLaundryToggle}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              inLaundry
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-white/90 hover:bg-blue-50'
            }`}
            aria-label={inLaundry ? 'הוצא מכביסה' : 'העבר לכביסה'}
          >
            <Loader className={`w-5 h-5 ${inLaundry ? 'text-white' : 'text-blue-600'}`} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between" dir="rtl">
        <h3 className="text-lg font-bold text-gray-800 truncate" title={name}>
          {name}
        </h3>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-gray-500 text-xs">צבע: {color}</span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map(tag => (
              <span
                key={tag.id}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  tag.userId === null
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosetItem;

