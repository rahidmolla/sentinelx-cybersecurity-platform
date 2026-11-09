import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentinelx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('sentinelx_token')) {
      // Clear token if invalid
      localStorage.removeItem('sentinelx_token');
      localStorage.removeItem('sentinelx_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

export const scanApi = {
  scan: (data) => api.post('/scans', data),
  getScans: () => api.get('/scans'),
  getScanById: (id) => api.get(`/scans/${id}`),
  deleteScan: (id) => api.delete(`/scans/${id}`),
  getPdfUrl: (id) => `${API_BASE_URL}/scans/${id}/pdf`
};

export const certApi = {
  analyze: (url) => api.post('/certificates/analyze', { url })
};

export const secApi = {
  analyze: (url) => api.post('/security/analyze', { url })
};

export const intelApi = {
  getAll: (params) => api.get('/intelligence', { params }),
  search: (q) => api.get('/intelligence/search', { params: { q } })
};

export const reportApi = {
  submit: (reportData) => api.post('/reports', reportData),
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  updateStatus: (id, data) => api.patch(`/reports/${id}/status`, data)
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity')
};

export const aiApi = {
  explain: (payload) => api.post('/ai/explain', payload)
};

export default api;
