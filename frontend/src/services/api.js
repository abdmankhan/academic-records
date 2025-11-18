import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const certificateService = {
  getAll: () => api.get('/certificates'),
  getById: (id) => api.get(`/certificates/${id}`),
  getByStudent: (studentId) => api.get(`/certificates/student/${studentId}`),
  create: (data) => api.post('/certificates', data),
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`),
  verify: (id, data) => api.post(`/certificates/${id}/verify`, data),
  getHistory: (id) => api.get(`/certificates/${id}/history`)
};

export const userService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData)
};

export const studentService = {
  register: (data) => api.post('/students/register', data),
  getAll: () => api.get('/students'),
  getByRollNumber: (rollNumber) => api.get(`/students/${rollNumber}`)
};

export const healthService = {
  check: () => api.get('/health')
};

export default api;