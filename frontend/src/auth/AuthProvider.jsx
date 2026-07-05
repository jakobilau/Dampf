import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const data = await apiFetch("/api/auth/me");
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            await loadUser();
        } catch (err) {
            console.error("LOGIN ERROR:", err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (err) {
            console.error("LOGOUT ERROR:", err.message);
        }

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

export const useAuth = () => useContext(AuthContext);