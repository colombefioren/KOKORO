"use client";

import { useState, useEffect } from "react";
import FriendsSidebar from "@/components/profile/friends-sidebar";
import MobileFriendsSidebar from "@/components/profile/mobile-friends-sidebar";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1">{children}</div>

      {isMobile ? (
        <MobileFriendsSidebar />
      ) : (
        <>
          <div className="w-80 hidden lg:block"></div>
          <div className="w-80 hidden lg:block fixed right-10 top-0 h-screen">
            <FriendsSidebar />
          </div>
        </>
      )}
    </div>
  );
}
