// Auto-logout after 1 hour of inactivity for security

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const LAST_ACTIVITY_KEY = 'ootd_last_activity';

let timeoutId = null;

/**
 * Update last activity timestamp
 */
export const updateLastActivity = () => {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

/**
 * Check if user has been inactive for more than 1 hour
 */
export const isInactive = () => {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return false;

  const now = Date.now();
  const diff = now - parseInt(lastActivity);
  return diff >= INACTIVITY_TIMEOUT;
};

/**
 * Clear user session (logout)
 */
export const clearSession = () => {
  localStorage.removeItem('ootd_authToken');
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  localStorage.removeItem('ootd_currentUser');

  // Redirect to login
  window.location.href = '/login';
};

/**
 * Start monitoring user activity
 */
export const startActivityMonitoring = () => {
  // Check inactivity immediately
  if (isInactive()) {
    clearSession();
    return;
  }

  // Update activity on user interaction
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  const activityHandler = () => {
    updateLastActivity();
    resetTimeout();
  };

  events.forEach(event => {
    document.addEventListener(event, activityHandler, true);
  });

  // Check every minute if user should be logged out
  const checkInactivity = () => {
    if (isInactive()) {
      clearSession();
    }
  };

  // Start interval check
  const intervalId = setInterval(checkInactivity, 60000); // Check every minute

  // Set initial timeout
  resetTimeout();

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, activityHandler, true);
    });
    clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  };
};

/**
 * Reset the inactivity timeout
 */
const resetTimeout = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    clearSession();
  }, INACTIVITY_TIMEOUT);
};

/**
 * Initialize activity monitoring (call this when user logs in)
 */
export const initializeActivityMonitoring = () => {
  // Set initial activity timestamp
  updateLastActivity();

  // Start monitoring
  return startActivityMonitoring();
};
