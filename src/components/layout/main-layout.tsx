"use client";
import Image from "next/image";
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
      <div className="fixed -top-2  -right-4">
        <Image
          width={400}
          height={400}
          alt="Kokoro Logo"
          src="/sakura.gif"
          className="p-4"
        />
      </div>
      <div className="">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-hidden">
        <div className="mx-18">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
