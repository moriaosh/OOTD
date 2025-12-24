import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import Layout from '../components/Layout';
import WardrobeOverlay from '../components/WardrobeOverlay';
import CreatePost from '../components/CreatePost';
import PostDetailModal from '../components/PostDetailModal';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await postsAPI.getFeed();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'שגיאה בשליפת הפיד');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handlePostCreated = (newPost) => {
    // If the new post is public, add it to the feed
    if (newPost.isPublic) {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    // Refresh feed to ensure consistency
    setTimeout(() => {
      fetchFeed();
    }, 500);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    setSelectedPost(updatedPost);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    setIsDetailModalOpen(false);
    setSelectedPost(null);
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
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'לפני רגע';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `לפני ${minutes} דקות`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `לפני ${hours} שעות`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `לפני ${days} ימים`;
    } else {
      return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Show welcome page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <>
        <WardrobeOverlay />
        <Layout>
          <main className="home-page">
            <h2 className="home-intro-title">היי לך! ❤️</h2>

            <p className="home-intro-text">
              ברוכה הבאה ל־<strong>OOTD</strong>, המקום שבו הארון שלך מקבל חיים חדשים
              והסטייל שלך הופך להרבה יותר קל, כיפי ומדויק.
            </p>

            <p className="home-intro-text">
              כאן מתחיל המסע שלך לעבר ארון דיגיטלי חכם — כזה שמכיר אותך,
              יודע מה את אוהבת ומציע לוקים שמתאימים לכל רגע ביום:
              מהלימודים, לעבודה, לדייט או לאירוע מיוחד 🪩
            </p>

            <p className="home-intro-text">
              אז יאללה יפה — בואי נצא לדרך ונבנה ביחד את הארון החכם שלך.
              הסטייל שלך הולך להיות בלתי־נוצח. 👠✨
            </p>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <Link
                to="/register"
                className="login-btn"
                style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '14px 40px' }}
              >
                התחילי עכשיו
              </Link>
            </div>
          </main>
        </Layout>
      </>
    );
  }

  // Show public feed for authenticated users
  return (
    <Layout>
      <div className="feed-container" dir="rtl">
        {/* Header */}
        <header className="feed-header">
          <h1 className="feed-title">פיד ציבורי</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="create-post-btn"
          >
            + צור פרסום חדש
          </button>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 ml-3" />
            <span className="text-lg text-gray-700">טוען פיד...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-semibold mb-2">{error}</p>
            <button
              onClick={fetchFeed}
              className="text-sm text-red-600 underline hover:text-red-800"
            >
              נסה שוב
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600 mb-2">
              עדיין אין פרסומים בפיד
            </p>
            <p className="text-gray-500 mb-6">
              תהיי הראשונה לשתף את הלוק שלך!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              צרי פרסום ראשון
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="feed-grid">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="feed-card cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                <div className="feed-card-image-wrapper">
                  <img
                    src={post.imageUrl}
                    alt={post.caption || 'פרסום'}
                    className="feed-card-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%239ca3af"%3Eתמונה לא זמינה%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="feed-card-content">
                  <p className="feed-card-caption">{post.caption}</p>
                  <div className="feed-card-footer">
                    <span className="feed-card-author">
                      {getUserDisplayName(post.user)}
                    </span>
                    <span className="feed-card-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedPost(null);
            }}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        )}

        {/* Create Post Modal */}
        <CreatePost
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </Layout>
  );
};

export default Home;

