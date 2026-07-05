import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthProvider";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return;

        const newSocket = io(window.location.origin, {
            withCredentials: true,
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("🟢 SOCKET CONNECTED:", newSocket.id);
            newSocket.emit("register", user.user_id);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);