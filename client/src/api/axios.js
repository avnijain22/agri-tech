import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('agritechUser'));

    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('agritechUser');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Get error message
export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong';

export default api;
