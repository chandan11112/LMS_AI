import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30s timeout
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("learnkro_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // FIX: don't redirect during auth routes (login/register)
      const isAuthRoute = error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");
      if (!isAuthRoute) {
        localStorage.removeItem("learnkro_token");
        localStorage.removeItem("learnkro_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
