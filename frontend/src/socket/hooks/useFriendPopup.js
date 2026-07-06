import { useEffect, useState } from "react";
import { useSocket } from "../SocketProvider";

export function useFriendPopup() {
  const socket = useSocket();
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      setPopup({
        user: data.fromUser
      });
    };

    socket.on("friend_request_popup", handler);

    return () => {
      socket.off("friend_request_popup", handler);
    };
  }, [socket]);

  return { popup, setPopup };
}