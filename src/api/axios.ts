import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  // Do not attach token for auth-related requests (login, registration, etc.)
  // This prevents issues where a stale/expired token causes login requests to fail.
  if (token && !config.url?.toLowerCase().includes("/auth/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle expired/invalid tokens ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // If we get 401, the session is invalid. Clear storage and redirect to login.
    // Exception: If we're already on a login page, don't trigger a redirect loop.
    if (status === 401) {
      storage.clearToken();
      storage.clearUserId();
      localStorage.removeItem("advisor");
      localStorage.removeItem("isSuperAdmin");

      const isAuthPage = window.location.pathname.includes("/login") || window.location.pathname.includes("/register");
      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
