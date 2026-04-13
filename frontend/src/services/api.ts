import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Points directly to your Node.js server!
  headers: {
    'Content-Type': 'application/json',
  },
});

// The "VIP Bouncer" Interceptor
// This intercepts EVERY outgoing request and automatically attaches the token!
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;