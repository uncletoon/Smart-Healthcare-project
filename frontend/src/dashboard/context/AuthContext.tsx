import React, { createContext, useState, useEffect } from "react";
import { authService, User } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: Record<string, any>) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem("admin_token");
      if (storedToken) {
        try {
          const profile = await authService.getProfile(storedToken);
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth validation failed:", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (credentials: Record<string, any>) => {
    const data = await authService.login(credentials);
    localStorage.setItem("admin_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (signUpData: Record<string, any>) => {
    const data = await authService.register(signUpData);
    localStorage.setItem("admin_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
