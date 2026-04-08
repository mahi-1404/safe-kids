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
  login:              (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register:           (name: string, email: string, phone: string, password: string) =>
    api.post('/api/auth/register', { name, email, phone, password }),
  resendVerification: (email: string) =>
    api.post('/api/auth/resend-verification', { email }),
  getProfile:         () =>
    api.get('/api/auth/profile'),
  updateProfile:      (data: { name?: string; phone?: string; fcmToken?: string }) =>
    api.patch('/api/auth/profile', data),
  changePassword:     (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }),
  forgotPassword:     (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword:      (token: string, newPassword: string) =>
    api.post('/api/auth/reset-password', { token, newPassword }),
};

// ─── Child ────────────────────────────────────────────────────────────────────
export const childApi = {
  getAll:  () => api.get('/api/child'),
  getOne:  (id: string) => api.get(`/api/child/${id}`),
  create:  (data: { name: string; age: number; agePreset?: string }) =>
    api.post('/api/child/create', data),
  update:  (id: string, data: Partial<{
    name: string; age: number; agePreset: string;
    screenTimeLimit: number; bedtimeStart: string; bedtimeEnd: string;
  }>) => api.patch(`/api/child/${id}`, data),
  delete:  (id: string) => api.delete(`/api/child/${id}`),
};

// ─── Commands ─────────────────────────────────────────────────────────────────
export const commandApi = {
  send: (childId: string, type: string, payload: Record<string, any> = {}) =>
    api.post('/api/command', { childId, type, payload }),
};

// ─── Location ─────────────────────────────────────────────────────────────────
export const locationApi = {
  getLatest:  (childId: string) => api.get(`/api/location/${childId}/latest`),
  getHistory: (childId: string, date: string) =>
    api.get(`/api/location/${childId}/history`, { params: { date } }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertApi = {
  getAll: (params?: {
    page?: number; limit?: number; childId?: string;
    type?: string; severity?: string; unreadOnly?: boolean;
  }) => api.get('/api/alert', { params }),
  markRead:    (id: string) => api.patch(`/api/alert/${id}/read`),
  markAllRead: (childId?: string) => api.patch('/api/alert/read-all', { childId }),
  delete:      (id: string) => api.delete(`/api/alert/${id}`),
};

// ─── Screen Time ──────────────────────────────────────────────────────────────
export const screenTimeApi = {
  getToday: (childId: string) => api.get(`/api/screentime/${childId}/today`),
  getWeek:  (childId: string) => api.get(`/api/screentime/${childId}/week`),
};

// ─── Geofence ─────────────────────────────────────────────────────────────────
export const geofenceApi = {
  getAll:  (childId: string) => api.get(`/api/geofence/${childId}`),
  create:  (data: object) => api.post('/api/geofence', data),
  update:  (id: string, data: object) => api.patch(`/api/geofence/${id}`, data),
  delete:  (id: string) => api.delete(`/api/geofence/${id}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  getDashboard: (childId: string) => api.get(`/api/reports/${childId}/dashboard`),
  getWeekly:    (childId: string) => api.get(`/api/reports/${childId}/weekly`),
  getMonthly:   (childId: string, year: number, month: number) =>
    api.get(`/api/reports/${childId}/monthly`, { params: { year, month } }),
  getCustom:    (childId: string, from: string, to: string) =>
    api.get(`/api/reports/${childId}/custom`, { params: { from, to } }),
  exportData:   (childId: string) =>
    api.get(`/api/reports/${childId}/export`, { responseType: 'blob' }),
};

// ─── SMS Logs ─────────────────────────────────────────────────────────────────
export const smslogApi = {
  getAll: (childId: string, params?: {
    page?: number; limit?: number; flaggedOnly?: boolean; phoneNumber?: string;
  }) => api.get(`/api/smslog/${childId}`, { params }),
  getFlagged: (childId: string) => api.get(`/api/smslog/${childId}/flagged`),
};

// ─── Call Logs ────────────────────────────────────────────────────────────────
export const calllogApi = {
  getAll: (childId: string, params?: {
    page?: number; limit?: number; direction?: string;
  }) => api.get(`/api/calllog/${childId}`, { params }),
  getStats: (childId: string, days?: number) =>
    api.get(`/api/calllog/${childId}/stats`, { params: { days } }),
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactApi = {
  getAll:   (childId: string, params?: { search?: string; blocked?: boolean; flagged?: boolean }) =>
    api.get(`/api/contact/${childId}`, { params }),
  block:    (id: string, isBlocked: boolean) => api.patch(`/api/contact/${id}/block`, { isBlocked }),
  flag:     (id: string, isFlagged: boolean, flagReason?: string) =>
    api.patch(`/api/contact/${id}/flag`, { isFlagged, flagReason }),
};

// ─── App Rules ────────────────────────────────────────────────────────────────
export const appRuleApi = {
  getAll:  (childId: string) => api.get(`/api/apprule/${childId}`),
  getPolicy: (childId: string) => api.get(`/api/apprule/${childId}/policy`),
  upsert:  (data: {
    childId: string; packageName: string; appName: string;
    category?: string; isBlocked: boolean;
    scheduleEnabled?: boolean; blockedFrom?: string;
    blockedUntil?: string; blockedDays?: number[];
    dailyLimitMinutes?: number;
  }) => api.post('/api/apprule', data),
  update:  (id: string, data: object) => api.patch(`/api/apprule/${id}`, data),
  delete:  (id: string) => api.delete(`/api/apprule/${id}`),
  bulk:    (childId: string, packages: Array<{ packageName: string; appName: string; category?: string }>, isBlocked: boolean) =>
    api.post('/api/apprule/bulk', { childId, packages, isBlocked }),
};

// ─── Web Filter ───────────────────────────────────────────────────────────────
export const webFilterApi = {
  getAll:       (childId: string) => api.get(`/api/webfilter/${childId}`),
  create:       (data: { childId: string; mode: string; url?: string; category?: string }) =>
    api.post('/api/webfilter', data),
  update:       (id: string, data: object) => api.patch(`/api/webfilter/${id}`, data),
  delete:       (id: string) => api.delete(`/api/webfilter/${id}`),
  applyPreset:  (childId: string) => api.post(`/api/webfilter/${childId}/apply-preset`),
};

// ─── Notification Preferences ─────────────────────────────────────────────────
export const notificationApi = {
  getPrefs:    () => api.get('/api/notification/preferences'),
  updatePrefs: (data: object) => api.patch('/api/notification/preferences', data),
};

// ─── Streaming (Agora) ────────────────────────────────────────────────────────
export const streamingApi = {
  getToken: (childId: string, type: 'camera' | 'screen' | 'audio' = 'camera') =>
    api.post('/api/streaming/token', { childId, type }),
  stop:     (childId: string, type: string) =>
    api.post('/api/streaming/stop', { childId, type }),
};

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaApi = {
  getPresignedUrl: (childId: string, filename: string) =>
    api.get('/api/media/presign', { params: { childId, filename } }),
  analyze:         (base64Image: string) =>
    api.post('/api/media/analyze', { base64Image }),
};

export default api;
