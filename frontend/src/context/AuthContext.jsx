import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 USER LADEN (/me)
  const loadUser = async () => {
    try {
      const res = await apiFetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGIN (COOKIE FLOW)
  const login = async (username, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      credentials: "include", // 🔥 WICHTIG
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "login failed");
    }

    // 🔥 danach user state syncen
    await loadUser();
  };

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    setUser(null);
  };

  // 🔥 INITIAL AUTH CHECK
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);