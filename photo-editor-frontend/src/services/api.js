import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ← ADD THIS LINE
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  googleLogin: () => {
    window.location.href = `${API_BASE_URL.replace('/api', '')}/api/auth/google`;
  },
};

// Photo APIs
export const photoAPI = {
  upload: (formData) => api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPhotos: (params) => api.get('/photos', { params }),
  getPhoto: (id) => api.get(`/photos/${id}`),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  searchPhotos: (query) => api.get('/photos/search', { params: { q: query } }),
};

// Album APIs
export const albumAPI = {
  create: (data) => api.post('/albums', data),
  getAlbums: () => api.get('/albums'),
  getAlbum: (id) => api.get(`/albums/${id}`),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
  addPhoto: (albumId, photoId) => api.post(`/albums/${albumId}/photos`, { photoId }),
  removePhoto: (albumId, photoId) => api.delete(`/albums/${albumId}/photos/${photoId}`),
};

// Image editing APIs
export const imageAPI = {
  saveEdited: (photoId, edits) => api.post(`/images/${photoId}/edit`, { edits }),
};

// Share APIs
export const shareAPI = {
  createShare: (albumId, expiresInDays) => 
    api.post(`/shares/albums/${albumId}`, { expiresInDays }),
  getSharedAlbum: (token) => api.get(`/shares/${token}`),
  getAlbumShares: (albumId) => api.get(`/shares/albums/${albumId}/shares`),
  deleteShare: (shareId) => api.delete(`/shares/${shareId}`),
};

export default api;