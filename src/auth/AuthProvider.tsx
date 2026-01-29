import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { saveToken, clearToken, getToken } from "../utils/token";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(getToken());

  const login = (jwt: string) => {
    saveToken(jwt);
    setToken(jwt);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("advisor");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
