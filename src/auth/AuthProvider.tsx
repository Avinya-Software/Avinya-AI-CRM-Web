import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { saveToken, saveUserId, clearToken, clearUserId, getToken, getUserId } from "../utils/token";

// ── One-time migration: move old unprefixed keys to new prefixed keys ──────────
const migrateOldToken = () => {
  if (!getToken()) {
    const oldToken = localStorage.getItem("token");
    if (oldToken) {
      saveToken(oldToken);
      localStorage.removeItem("token");
    }
  }
  if (!getUserId()) {
    const oldUserId = localStorage.getItem("userId");
    if (oldUserId) {
      saveUserId(oldUserId);
      localStorage.removeItem("userId");
    }
  }
};
migrateOldToken();
// ──────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(getToken());
  const [userId, setUserId] = useState<string | null>(getUserId());

  const login = (jwt: string, id: string) => {
    saveToken(jwt);
    saveUserId(id);
    setToken(jwt);
    setUserId(id);
  };

  const logout = () => {
    clearToken();
    clearUserId();
    localStorage.removeItem("advisor");
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
