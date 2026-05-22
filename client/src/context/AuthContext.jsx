import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = window.localStorage.getItem("sop-token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authAPI.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        window.localStorage.removeItem("sop-token");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const payload = await authAPI.login(email, password);
      window.localStorage.setItem("sop-token", payload.token);
      setUser(payload.user);
      setIsAuthenticated(true);
      return payload.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const payload = await authAPI.register(data);
      window.localStorage.setItem("sop-token", payload.token);
      setUser(payload.user);
      setIsAuthenticated(true);
      return payload.user;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } finally {
      window.localStorage.removeItem("sop-token");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
