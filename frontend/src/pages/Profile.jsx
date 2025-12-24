import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut } from 'lucide-react';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
          <div className="profile-info">
            <div className="profile-avatar">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="profile-details">
              <h2 className="profile-name">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'משתמש'}
              </h2>
              <p className="profile-email">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              התנתקות
            </button>
          </div>
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

