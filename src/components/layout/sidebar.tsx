"use client";

import {
  Clapperboard,
  User,
  Settings,
  MessageCircleHeart,
  Bell,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import SidebarNav from "./sidebar-nav";
import SidebarLogout from "./sidebar-logout";
import SidebarLogo from "./sidebar-logo";
import { useNotificationStore } from "@/store/useNotificationStore";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";

const Sidebar = () => {
  const pathname = usePathname();
  const activeItem = pathname.split("/")[1] || "rooms";
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { data: friendRequests = [] } = usePendingFriendRequests();

  const menuItems = [
    { id: "rooms", label: "", icon: Clapperboard },
    { id: "messages", label: "Messages", icon: MessageCircleHeart },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount,
    },
    {
      id: "connect",
      label: "Connect",
      icon: Users,
      badge: friendRequests.length,
    },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="sticky z-[100000] top-0">
      <div className="w-21 flex flex-col justify-between min-h-screen hover:w-64 group transition-all duration-500 ease-in-out bg-darkblue shadow-2xl border-r border-light-royal-blue/15 overflow-hidden">
        <div>
          <div className="border-b border-bluish-gray/30 flex flex-col items-center gap-3 pt-4 pb-3">
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
