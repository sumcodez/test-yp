// src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/src/lib/axios";

type User = {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  profile_image_url?: string;
} | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  sendOtp: (phone: string) => Promise<{ ok: boolean; message?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // fetch /api/auth/me once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (!mounted) return;
        if (res.status === 200) setUser(res.data.user ?? null);
        else setUser(null);
      } catch (err) {
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function sendOtp(phone: string) {
    try {
      const res = await api.post("/api/auth/login", { phone_number: phone });
      return { ok: res.status >= 200 && res.status < 300, message: res.data?.message || res.data?.detail };
    } catch (err: any) {
      return { ok: false, message: err?.response?.data?.message || err?.response?.data?.detail || err.message || "Network error" };
    }
  }

  async function verifyOtp(phone: string, otp: string) {
    try {
      // This endpoint should set HttpOnly access & refresh cookies and return user data
      const res = await api.post("/api/auth/signup", { phone_number: phone, otp });
      if (res.status >= 200 && res.status < 300) {
        // server returns user in res.data.user or res.data.data
        const userFromServer = res.data?.user ?? res.data?.data ?? null;
        if (userFromServer) setUser(userFromServer);
        return { ok: true };
      }
      return { ok: false, error: res.data?.error || "Verification failed" };
    } catch (err: any) {
      return { ok: false, error: err?.response?.data?.message || err?.message || "Verification failed" };
    }
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore errors during logout
    } finally {
      setUser(null);
    }
  }

  async function refreshUser() {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      if (res.status === 200) setUser(res.data.user ?? null);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
