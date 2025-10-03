"use client";

import Sidebar from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-ebony flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-hidden">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
