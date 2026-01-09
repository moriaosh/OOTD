import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="top-nav">
      <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              דף הבית
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/feed" className={isActive('/feed') ? 'active' : ''}>
                הפרסומים שלי
              </Link>
            </li>
          )}
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                  התחברות
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register') ? 'active' : ''}>
                  הרשמה
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/closet" className={isActive('/closet') ? 'active' : ''}>
                  הארון שלי
                </Link>
              </li>
              <li>
                <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''}>
                  מועדפים
                </Link>
              </li>
              <li>
                <Link to="/suggestions" className={isActive('/suggestions') ? 'active' : ''}>
                  המלצות לוקים
                </Link>
              </li>
              <li>
                <Link to="/weekly-planner" className={isActive('/weekly-planner') ? 'active' : ''}>
                  תכנון שבועי
                </Link>
              </li>
              <li>
                <Link to="/color-analysis" className={isActive('/color-analysis') ? 'active' : ''}>
                  ניתוח צבעים
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                  פרופיל אישי
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="nav-logout-btn"
                >
                  התנתקות
                </button>
              </li>
            </>
          )}
        </ul>
    </nav>
  );
};

export default Navbar;

