import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { initSocket, joinRoom, sendMessage } from "../../app/services/socket";
import { Message } from "../../app/types";

export const useChat = (roomId: string, token: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Socket bağlantısı
    socketRef.current = initSocket(token);

    socketRef.current.on("connect", () => {
      joinRoom(roomId);
    });

    // Mesaj dinle
    socketRef.current.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    setLoading(false);

    return () => {
      socketRef.current?.off("message");
      socketRef.current?.off("userJoined");
    };
  }, [roomId, token]);

  const send = (content: string) => {
    sendMessage(roomId, content);
  };

  return { messages, setMessages, loading, send };
};
