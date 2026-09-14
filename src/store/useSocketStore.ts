"use client";

import { create } from "zustand";
import { getSocket, disconnectSocket, TypedSocket } from "@/lib/socket";

interface SocketState {
  socket: TypedSocket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => {
  if (typeof window === "undefined") {
    return {
      socket: null,
      isConnected: false,
      connect: async () => {},
      disconnect: () => {},
    };
  }

  const socketInstance = getSocket();

  socketInstance.on("connect", () => {
    set({ isConnected: true });
  });

  socketInstance.on("disconnect", () => {
    set({ isConnected: false });
  });

  const connect = async () => {
    if (socketInstance.connected) return;

    try {
      const res = await fetch("/api/auth/socket-token");
      if (!res.ok) return;

      const { token } = await res.json();
      socketInstance.auth = { token };
      socketInstance.connect();
    } catch (err) {
      console.error("[Socket] Failed to fetch auth token:", err);
    }
  };

  const disconnect = () => {
    disconnectSocket();
    set({ socket: null, isConnected: false });
  };

  return {
    socket: socketInstance,
    isConnected: false,
    connect,
    disconnect,
  };
});
