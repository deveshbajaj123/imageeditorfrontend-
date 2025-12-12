import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://image-api-fschcebmh0habtd6.centralindia-01.azurewebsites.net/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),

  // Google OAuth
  googleLogin: () => {
    window.location.href =
      "https://image-api-fschcebmh0habtd6.centralindia-01.azurewebsites.net/api/auth/google";
  },
};

// Photo API
export const photoAPI = {
  upload: (formData) =>
    api.post("/photos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getPhotos: (params) => api.get("/photos", { params }),
  getPhoto: (id) => api.get(`/photos/${id}`),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
  searchPhotos: (query) => api.get("/photos/search", { params: { q: query } }),
};

// Album API
export const albumAPI = {
  create: (data) => api.post("/albums", data),
  getAlbums: () => api.get("/albums"),
  getAlbum: (id) => api.get(`/albums/${id}`),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
  addPhoto: (albumId, photoId) =>
    api.post(`/albums/${albumId}/photos`, { photoId }),
  removePhoto: (albumId, photoId) =>
    api.delete(`/albums/${albumId}/photos/${photoId}`),
};

// Image Editing API
export const imageAPI = {
  saveEdited: (photoId, edits) => api.post(`/images/${photoId}/edit`, { edits }),
};

// Sharing API
export const shareAPI = {
  createShare: (albumId, expiresInDays) =>
    api.post(`/shares/albums/${albumId}`, { expiresInDays }),
  getSharedAlbum: (token) => api.get(`/shares/${token}`),
  getAlbumShares: (albumId) => api.get(`/shares/albums/${albumId}/shares`),
  deleteShare: (shareId) => api.delete(`/shares/${shareId}`),
};

export default api;
