import axios from "axios";

const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const baseURL = apiOrigin.endsWith("/api") ? apiOrigin : `${apiOrigin}/api`;

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
