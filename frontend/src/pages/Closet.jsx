import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle, AlertCircle, Loader2, X, Tag as TagIcon } from 'lucide-react';
import { closetAPI } from '../services/api';
import UploadModal from '../components/UploadModal';
import ClosetItem from '../components/ClosetItem';
import TagManager from '../components/TagManager';
import Layout from '../components/Layout';

const Closet = () => {
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get category from URL on mount
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const fetchClosetItems = async () => {
    try {
      setLoading(true);
      const data = await closetAPI.getMyItems();
      setClosetItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching closet items:', err);
      setError(err.message || 'שגיאה בשליפת הארון');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosetItems();
  }, []);

  const handleUploadSuccess = (newItem) => {
    setClosetItems((prevItems) => [newItem, ...prevItems]);
    setIsModalOpen(false);
  };

  const filteredItems = closetItems.filter((item) => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchParams({ category });
    // Scroll to items
    setTimeout(() => {
      document.querySelector('.closet-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
    setSearchParams({});
  };

  const categories = [
    { name: 'חולצות / טופים', image: '/images/categories/tops.png', value: 'חולצה' },
    { name: 'מכנסיים / חצאיות', image: '/images/categories/bottoms.png', value: 'מכנסיים' },
    { name: 'שמלות', image: '/images/categories/dresses.png', value: 'שמלה' },
    { name: 'ז\'קטים / מעילים', image: '/images/categories/outerwear.png', value: 'מעיל' },
    { name: 'נעליים', image: '/images/categories/shoes.png', value: 'נעל' },
    { name: 'אקססוריז', image: '/images/categories/accessories.png', value: 'אביזר' },
  ];

  return (
    <Layout>
      <div className="closet-container" dir="rtl">
      <header className="closet-header">
        <h1 className="closet-title">הארון שלי</h1>
        <div className="closet-actions">
          <button
            onClick={() => setIsModalOpen(true)}
            className="action-btn primary"
          >
            <PlusCircle className="w-5 h-5" />
            הוסף פריט
          </button>
          <button
            onClick={() => setIsTagManagerOpen(true)}
            className="action-btn secondary"
          >
            <TagIcon className="w-5 h-5" />
            ניהול תגיות
          </button>
          <button
            onClick={() => navigate('/suggestions')}
            className="action-btn secondary"
          >
            <Search className="w-5 h-5" />
            המלצות לוקים
          </button>
        </div>
      </header>

      {/* Welcome Box */}
      <div className="intro-box">
        <h2>✨ ברוכה הבאה לארון הדיגיטלי שלך ✨</h2>
        <p>
          כאן תמצאי את כל הבגדים שלך מסודרים לפי קטגוריות.  
          רוצה לבנות לוק חדש מהמם? 😍  
          לחצי על הכפתור!
        </p>
        <button 
          className="look-btn"
          onClick={() => navigate('/suggestions')}
        >
          👗 צאי להרכיב לוק
        </button>
      </div>

      {/* Category Grid */}
      <section className="category-grid">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            className={`category-box ${selectedCategory === category.value ? 'active' : ''}`}
          >
            <img src={category.image} alt={category.name} />
            <p>{category.name}</p>
          </button>
        ))}
      </section>

      {/* Active Filter Display */}
      {selectedCategory && (
        <div className="active-filter">
          <span>מציגה: {categories.find(c => c.value === selectedCategory)?.name}</span>
          <button onClick={clearCategoryFilter} className="clear-filter-btn">
            <X className="w-4 h-4" />
            נקה סינון
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="חפשי לפי שם, קטגוריה או צבע..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 ml-3" />
          <span className="text-lg text-gray-700">טוען ארון...</span>
        </div>
      )}

      {error && (
        <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-8">
          <p>{error}</p>
          <button onClick={fetchClosetItems} className="mt-2 text-sm underline">
            נסה שוב
          </button>
        </div>
      )}

      {/* Items Display */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600">
            {searchTerm ? 'לא נמצאו פריטים התואמים לחיפוש' : 'אין עדיין פריטים בארון.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              הוסיפי פריט ראשון
            </button>
          )}
        </div>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <div className="closet-grid">
          {filteredItems.map((item) => (
            <ClosetItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Tag Manager Modal */}
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
      </div>
    </Layout>
  );
};

export default Closet;

