import { useState } from 'react';
import { AlertCircle, Star } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

const ClosetItem = ({ item }) => {
  const { id, name, category, color, imageUrl, tags = [] } = item;
  const [imageError, setImageError] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

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

        {/* Favorite Star Button */}
        <button
          onClick={handleFavoriteClick}
          className="favorite-btn"
          aria-label={isFavorite(id) ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              isFavorite(id)
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-400 hover:text-yellow-400'
            }`}
          />
        </button>
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

