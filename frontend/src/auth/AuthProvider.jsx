import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const res = await apiFetch("/api/auth/me");

            if (!res.ok) {
                setUser(null);
                return;
            }

            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) throw new Error("login failed");

        await loadUser();
    };

    const logout = async () => {
        await apiFetch("/api/auth/logout", {
            method: "POST",
        });

        setUser(null);
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/* 👇 DAS IST DER WICHTIGE TEIL */
export const useAuth = () => useContext(AuthContext);