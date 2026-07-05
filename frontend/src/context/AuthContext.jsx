import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthProvider";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(window.location.origin, {
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", user.user_id);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);