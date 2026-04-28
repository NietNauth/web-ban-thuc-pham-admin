import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const requestUrl = error.config?.url || '';

    // Handle global errors, e.g., 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Không redirect nếu đang gọi login — để component tự handle lỗi
      if (!requestUrl.includes('/admin/login') && !requestUrl.includes('/auth/login')) {
        localStorage.removeItem('admin_token');
        // Using window.location to strictly redirect and reload to clear states
        window.location.href = '/login';
      }
    } else if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        let firstError = Object.values(errors)[0];
        if (Array.isArray(firstError)) {
          firstError = firstError[0];
        }
        error.response.data.message = firstError;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
