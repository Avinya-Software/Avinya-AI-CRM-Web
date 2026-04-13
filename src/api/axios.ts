import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// ── Request interceptor: attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle truly expired/invalid tokens ─────────────────
// IMPORTANT: Do NOT clear token on every 401.
// Some endpoints return 401 for permission/tenant reasons even with a valid token.
// Only treat 401 as "token expired" when there is no valid token anyway.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentToken = storage.getToken();

    // Only redirect to login if we got 401 AND we don't have a token
    // (meaning our token really is missing/invalid at a fundamental level).
    // If we DO have a token and get 401, it's likely a permissions/business error — let it propagate.
    if (status === 401 && !currentToken) {
      storage.clearToken();
      storage.clearUserId();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
