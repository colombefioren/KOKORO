"use client";

import { Clapperboard, User, Settings,MessageCircleHeart } from "lucide-react";
import { usePathname } from "next/navigation";
import SidebarNav from "./sidebar-nav";
import SidebarLogout from "./sidebar-logout";
import SidebarLogo from "./sidebar-logo";

const Sidebar = () => {
  const pathname = usePathname();
  const activeItem = pathname.split("/")[1] || "rooms";

  const menuItems = [
    { id: "rooms", label: "", icon: Clapperboard },
    { id: "messages", label: "Messages", icon: MessageCircleHeart },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },

  ];

  return (
    <div className="sticky top-0">
      <div className="w-21 flex flex-col justify-between min-h-screen hover:w-64 group transition-all duration-500 ease-in-out bg-darkblue shadow-2xl border-r border-light-royal-blue/20 backdrop-blur-xl overflow-hidden">
        <div>
          <div className=" border-b border-bluish-gray/30 flex justify-center">
            <SidebarLogo />
          </div>

          <SidebarNav menuItems={menuItems} activeItem={activeItem} />
        </div>

        <SidebarLogout />
      </div>
    </div>
  );
};

export default Sidebar;
