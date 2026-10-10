import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : { success: false, message: 'Network error occurred' });
  }
);

export default api;
