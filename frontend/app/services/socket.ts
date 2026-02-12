import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../utils/api";

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId: string) => {
  socket?.emit("joinRoom", roomId);
};

export const sendMessage = (roomId: string, content: string) => {
  socket?.emit("sendMessage", { roomId, content });
};

export const onMessage = (callback: (msg: any) => void) => {
  socket?.on("message", callback);
};

export const onUserJoined = (callback: (data: any) => void) => {
  socket?.on("userJoined", callback);
};
