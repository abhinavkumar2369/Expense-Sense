/**
 * Authentication Context
 * =======================
 * Global auth state via React Context + localStorage persistence.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { User, APIResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<APIResponse<{ access_token: string; user: User }>>(
      "/auth/login",
      { email, password }
    );
    const { access_token, user: userData } = res.data.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<APIResponse<{ access_token: string; user: User }>>(
      "/auth/register",
      { name, email, password }
    );
    const { access_token, user: userData } = res.data.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
