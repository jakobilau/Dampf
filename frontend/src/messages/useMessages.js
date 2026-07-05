import { useEffect } from "react";
import { useSocket } from "../socket/SocketProvider";

export function useMessages(onMessage) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("new_message", onMessage);

    return () => {
      socket.off("new_message", onMessage);
    };
  }, [socket, onMessage]);
}