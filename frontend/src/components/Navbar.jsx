import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className="top-nav">
        {/* Hamburger Button - Only visible on mobile */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''} onClick={handleLinkClick}>
              דף הבית
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/feed" className={isActive('/feed') ? 'active' : ''} onClick={handleLinkClick}>
                הפרסומים שלי
              </Link>
            </li>
          )}
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className={isActive('/login') ? 'active' : ''} onClick={handleLinkClick}>
                  התחברות
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive('/register') ? 'active' : ''} onClick={handleLinkClick}>
                  הרשמה
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/closet" className={isActive('/closet') ? 'active' : ''} onClick={handleLinkClick}>
                  הארון שלי
                </Link>
              </li>
              <li>
                <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''} onClick={handleLinkClick}>
                  מועדפים
                </Link>
              </li>
              <li>
                <Link to="/suggestions" className={isActive('/suggestions') ? 'active' : ''} onClick={handleLinkClick}>
                  המלצות לוקים
                </Link>
              </li>
              <li>
                <Link to="/weekly-planner" className={isActive('/weekly-planner') ? 'active' : ''} onClick={handleLinkClick}>
                  תכנון שבועי
                </Link>
              </li>
              <li>
                <Link to="/color-analysis" className={isActive('/color-analysis') ? 'active' : ''} onClick={handleLinkClick}>
                  ניתוח צבעים
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile') ? 'active' : ''} onClick={handleLinkClick}>
                  פרופיל אישי
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="nav-logout-btn"
                >
                  התנתקות
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;

