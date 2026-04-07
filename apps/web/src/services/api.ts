import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, phone: string, password: string) =>
    api.post('/api/auth/register', { name, email, phone, password }),
  resendVerification: (email: string) =>
    api.post('/api/auth/resend-verification', { email }),
};

// ─── Child ────────────────────────────────────────────────────────────────────

export const childApi = {
  getAll: () => api.get('/api/child'),
  getOne: (id: string) => api.get(`/api/child/${id}`),
  create: (data: { name: string; age: number }) => api.post('/api/child/create', data),
};

// ─── Commands ─────────────────────────────────────────────────────────────────

export const commandApi = {
  send: (childId: string, type: string, payload: Record<string, any> = {}) =>
    api.post('/api/command', { childId, type, payload }),
};

// ─── Location ─────────────────────────────────────────────────────────────────

export const locationApi = {
  getLatest: (childId: string) => api.get(`/api/location/${childId}/latest`),
  getHistory: (childId: string, date: string) =>
    api.get(`/api/location/${childId}/history`, { params: { date } }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alertApi = {
  getAll: () => api.get('/api/alert'),
  markRead: (id: string) => api.patch(`/api/alert/${id}/read`),
};

// ─── Screen Time ──────────────────────────────────────────────────────────────

export const screenTimeApi = {
  getToday: (childId: string) => api.get(`/api/screentime/${childId}/today`),
  getWeek: (childId: string) => api.get(`/api/screentime/${childId}/week`),
};

// ─── Geofence ─────────────────────────────────────────────────────────────────

export const geofenceApi = {
  getAll: (childId: string) => api.get(`/api/geofence/${childId}`),
  create: (data: object) => api.post('/api/geofence', data),
  update: (id: string, data: object) => api.patch(`/api/geofence/${id}`, data),
  delete: (id: string) => api.delete(`/api/geofence/${id}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsApi = {
  getDashboard: (childId: string) => api.get(`/api/reports/${childId}/dashboard`),
  getWeekly: (childId: string) => api.get(`/api/reports/${childId}/weekly`),
};

export default api;
