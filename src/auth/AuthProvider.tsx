import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { storage } from "../utils/storage";

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch { return true; }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const t = storage.getToken();
    return t && !isTokenExpired(t) ? t : null;
  });
  const [userId, setUserId] = useState<string | null>(storage.getUserId());

  const login = (jwt: string, id: string) => {
    storage.setToken(jwt);
    storage.setUserId(id);
    setToken(jwt);
    setUserId(id);
  };

  const logout = () => {
    storage.clearToken();
    storage.clearUserId();
    localStorage.removeItem("advisor");
    setToken(null);
    setUserId(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
