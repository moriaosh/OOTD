const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('ootd_authToken');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Clear invalid token
    localStorage.removeItem('ootd_authToken');
    localStorage.removeItem('ootd_currentUser');
    throw new Error('אימות נכשל. אנא התחברו מחדש.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'שגיאת שרת' }));
    throw new Error(errorData.message || 'שגיאה בהתחברות לשרת');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'שגיאה בהרשמה' }));
      throw new Error(errorData.message || 'שגיאה בהרשמה');
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('ootd_authToken', data.token);
      if (data.user) {
        localStorage.setItem('ootd_currentUser', JSON.stringify(data.user));
      }
    }
    return data;
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'שגיאה בהתחברות' }));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || 'אימייל או סיסמה שגויים.');
      }

      const data = await response.json();
      console.log('Login successful, received token:', !!data.token);
      if (data.token) {
        localStorage.setItem('ootd_authToken', data.token);
        if (data.user) {
          localStorage.setItem('ootd_currentUser', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (error) {
      console.error('Login fetch error:', error);
      // If it's a network error, provide a more helpful message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('לא ניתן להתחבר לשרת. ודאי שהשרת רץ על פורט 5000.');
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('ootd_authToken');
    localStorage.removeItem('ootd_currentUser');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('ootd_currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// Closet API
export const closetAPI = {
  getMyItems: async () => {
    return fetchWithAuth('/closet/my-items', {
      method: 'GET',
    });
  },

  addItem: async (formData) => {
    return fetchWithAuth('/closet/add-item', {
      method: 'POST',
      body: formData, // FormData with image
    });
  },

  getSuggestions: async () => {
    return fetchWithAuth('/closet/suggestions', {
      method: 'GET',
    });
  },
};

// Tags API
export const tagsAPI = {
  getTags: async () => {
    return fetchWithAuth('/tags', {
      method: 'GET',
    });
  },

  createTag: async (name) => {
    return fetchWithAuth('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  updateTag: async (id, name) => {
    return fetchWithAuth(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  deleteTag: async (id) => {
    return fetchWithAuth(`/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

