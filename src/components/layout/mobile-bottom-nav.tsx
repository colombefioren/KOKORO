"use client";

import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, MessageCircleHeart, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "rooms", label: "Rooms", icon: Clapperboard, path: "/" },
  { id: "messages", label: "Messages", icon: MessageCircleHeart, path: "/messages" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-darkblue/95 backdrop-blur-lg border-t border-light-royal-blue/15 safe-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.path ||
            (tab.path !== "/" && pathname.startsWith(tab.path));

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-light-royal-blue"
                  : "text-light-bluish-gray hover:text-white/70"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span
                className={cn(
                  "text-[10px] leading-tight transition-all duration-200",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 w-5 h-0.5 bg-light-royal-blue rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
