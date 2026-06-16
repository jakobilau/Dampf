import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";
import { socket } from "../socket/index";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // Socket registrieren
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("register", data.user_id);

    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "login failed");
    }

    await loadUser();
  };
  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error()
    }

    socket.disconnect();
    setUser(null);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Test Listener
  useEffect(() => {
    socket.on("new_message", (data) => {
      console.log("Neue Nachricht:", data);
    });

    return () => {
      socket.off("new_message");
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);