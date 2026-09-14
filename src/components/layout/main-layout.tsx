"use client";
import Sidebar from "./sidebar";
import MobileSidebar from "./mobile-sidebar";
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
    }
  }, [socket, isConnected, userId]);

  return (
    <div className="min-h-screen bg-ebony flex">
      <MobileSidebar />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-hidden">
        <div className="mx-4 lg:mx-10 pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
