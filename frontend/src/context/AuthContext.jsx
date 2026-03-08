import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, login, register } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("expenseSenseUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("expenseSenseUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("expenseSenseUser");
    }
  }, [user]);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const data = await login(credentials);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (payload) => {
    setLoading(true);
    try {
      const data = await register(payload);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!user?.token) return null;
    const profile = await getProfile();
    const next = { ...user, ...profile };
    setUser(next);
    return next;
  };

  const value = useMemo(
    () => ({ user, loading, loginUser, registerUser, logout, refreshProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
