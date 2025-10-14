"use client";

import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => {
  if (typeof window === "undefined") {
    return {
      socket: null,
      isConnected: false,
      disconnect: () => {},
    };
  }

  const socketInstance = io(process.env.NEXT_SOCKET_BASE_URL, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socketInstance.on("connect", () => {
    set({ socket: socketInstance, isConnected: true });
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    set({ isConnected: false });
    console.warn("⚠️ Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err);
  });

  const disconnect = () => {
    socketInstance.disconnect();
    set({ socket: null, isConnected: false });
  };

  return {
    socket: socketInstance,
    isConnected: false,
    disconnect,
  };
});
