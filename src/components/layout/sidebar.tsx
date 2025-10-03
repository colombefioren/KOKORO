"use client";

import { Clapperboard, User, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import SidebarNav from "./sidebar-nav";
import SidebarLogout from "./sidebar-logout";
import SidebarLogo from "./sidebar-logo";

const Sidebar = () => {
  const pathname = usePathname();
  const activeItem = pathname.split("/")[1] || "rooms";

  const menuItems = [
    { id: "rooms", label: "", icon: Clapperboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="relative ml-6">
      <div className="w-21 hover:w-64 group transition-all duration-500 ease-in-out bg-darkblue rounded-3xl shadow-2xl border border-light-royal-blue/20 backdrop-blur-xl overflow-hidden">
        <div className=" border-b border-bluish-gray/30 flex justify-center">
          <SidebarLogo />
        </div>

        <SidebarNav menuItems={menuItems} activeItem={activeItem} />

        <SidebarLogout />
      </div>
    </div>
  );
};

export default Sidebar;
