"use client";
import Sidebar from "./sidebar";
import { useSocketStore } from "@/store/useSocketStore";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  userId?: string;
}

const MainLayout = ({ children, userId }: MainLayoutProps) => {
  const { socket, isConnected } = useSocketStore();

  useEffect(() => {
    if (socket && isConnected && userId) {
      socket.emit("join", { userId: userId });
      console.log("📡 User joined:", userId);
    }
  }, [socket, isConnected, userId]);

  return (
    <div className="min-h-screen bg-ebony flex">
      <div>
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-hidden">
        <div className="lg:mx-18 mx-10">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
