"use client";

import { create } from "zustand";
import { getSocket, disconnectSocket, TypedSocket } from "@/lib/socket";

interface SocketState {
  socket: TypedSocket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => {
  if (typeof window === "undefined") {
    return {
      socket: null,
      isConnected: false,
      connect: () => {},
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

  const connect = () => {
    if (!socketInstance.connected) {
      socketInstance.connect();
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
