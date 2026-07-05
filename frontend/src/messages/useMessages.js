import { useEffect } from "react";
import { useSocket } from "../socket/SocketProvider";

export function useMessages(onMessage) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

              const handler = (msg) => {
      console.log("🔥 SOCKET RECEIVED new_message:", msg);
      onMessage(msg);
    };


    socket.on("new_message", onMessage);

    return () => {
      socket.off("new_message", onMessage);
    };
  }, [socket, onMessage]);
}