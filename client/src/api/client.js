import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('agritech_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
    localStorage.removeItem('agritech_token');
    if (location.pathname !== '/login') location.href = '/login';
  }
  return Promise.reject(err);
});

export const errMsg = e => e.response?.data?.message || e.message || 'Something went wrong';
export default api;
