import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Edit2, Camera, Palette, BarChart3 } from 'lucide-react';
import Layout from '../components/Layout';
import BackupRestore from '../components/BackupRestore';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profilePicture: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          profilePicture: data.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('ootd_authToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({ ...prev, ...data.user }));
        setIsEditMode(false);
        alert('הפרופיל עודכן בהצלחה!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('שגיאה בעדכון הפרופיל');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="profile-container" dir="rtl">
      <div className="profile-wrapper">
        <header className="profile-header">
          <h1 className="profile-title">פרופיל אישי</h1>
        </header>

        <div className="profile-card">
          {loading ? (
            <div className="text-center py-8">טוען פרופיל...</div>
          ) : (
            <>
              <div className="profile-info">
                <div className="profile-avatar relative">
                  {profileData?.profilePicture && profileData.profilePicture !== '/images/default-profile.png' ? (
                    <img
                      src={profileData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-indigo-600" />
                  )}
                  {isEditMode && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600"
                      title="שנה תמונה"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="profile-details flex-1">
                  {isEditMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">שם פרטי</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="שם פרטי"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">שם משפחה</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="שם משפחה"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">קישור לתמונת פרופיל</label>
                        <input
                          type="url"
                          value={formData.profilePicture}
                          onChange={(e) => setFormData({...formData, profilePicture: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                        >
                          שמור שינויים
                        </button>
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            setFormData({
                              firstName: profileData.firstName || '',
                              lastName: profileData.lastName || '',
                              profilePicture: profileData.profilePicture || ''
                            });
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="profile-name">
                        {profileData?.firstName && profileData?.lastName
                          ? `${profileData.firstName} ${profileData.lastName}`
                          : 'משתמש'}
                      </h2>
                      <p className="profile-email">
                        <Mail className="w-4 h-4" />
                        {profileData?.email || user?.email}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {!isEditMode && (
                <div className="profile-actions">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    ערוך פרופיל
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                    התנתקות
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Color Analysis Section */}
        {!loading && profileData?.colorAnalyses && profileData.colorAnalyses.length > 0 && (
          <div className="profile-card mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">ניתוח הצבעים שלי</h3>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">עונה</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {profileData.colorAnalyses[0].season}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">גוון עור</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {profileData.colorAnalyses[0].skinTone}
                  </p>
                </div>
              </div>
              {profileData.colorAnalyses[0].bestColors && profileData.colorAnalyses[0].bestColors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">הצבעים הכי מתאימים לך:</p>
                  <div className="flex gap-2 flex-wrap">
                    {profileData.colorAnalyses[0].bestColors.slice(0, 8).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/color-analysis')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm underline"
              >
                עבור לניתוח צבעים מלא →
              </button>
            </div>
          </div>
        )}

        {/* Wardrobe Statistics Section */}
        {!loading && (
          <div className="profile-card mt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-800">סטטיסטיקות הארון</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              צפה בסטטיסטיקות מפורטות על הפריטים בארון שלך, חלוקה לפי קטגוריות, צבעים, עונות ועוד
            </p>
            <button
              onClick={() => navigate('/statistics')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium flex items-center justify-center gap-2 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              צפה בסטטיסטיקות מלאות
            </button>
          </div>
        )}

        {/* Backup & Restore Section */}
        <div className="profile-card mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">גיבוי ושחזור נתונים</h3>
          <p className="text-gray-600 mb-4 text-sm">
            גבה את כל הנתונים שלך (פריטים, תגיות, לוקים, פוסטים ועוד) לקובץ JSON
          </p>
          <BackupRestore />
        </div>

        {showLogoutConfirm && (
          <div className="modal-overlay" style={{ display: 'flex', zIndex: 10000 }}>
            <div className="modal-box" dir="rtl">
              <h3 className="modal-title">התנתקות</h3>
              <p className="modal-text">האם את בטוחה שברצונך להתנתק?</p>
              <div className="modal-actions">
                <button
                  onClick={handleLogout}
                  className="save-btn"
                >
                  כן, התנתק
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="close-btn"
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

