"use client";

import { useState, useRef, useEffect } from "react";
import { Users, Bell } from "lucide-react";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import {  User } from "@/types/user";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";

const FriendsSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "notifications">(
    "friends"
  );
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const { data: users } = useSearchUsers();

  const {data: friendRequests, loading : requestLoading,error : requestError} = usePendingFriendRequests();


  useEffect(() => {
    const activeIndex = activeTab === "friends" ? 0 : 1;
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement) {
      const newStyle = {
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      };
      setSliderStyle(newStyle);
    }
  }, [activeTab]);

  const filteredFriends = users.filter((user: User) =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-l border-light-royal-blue/20 py-6 pl-10 h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white font-fredoka">Connect</h2>
        <div className="relative flex gap-1 bg-darkblue rounded-xl p-1">
          <div
            className="absolute bottom-1 top-1 rounded-lg transition-all duration-300 bg-gradient-to-r from-light-royal-blue to-plum shadow-lg"
            style={{
              left: sliderStyle.left,
              width: sliderStyle.width,
            }}
          />

          <button
            ref={(el) => {
              tabsRef.current[0] = el;
            }}
            onClick={() => setActiveTab("friends")}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-300 relative z-10 ${
              activeTab === "friends"
                ? "text-white"
                : "text-light-bluish-gray hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            ref={(el) => {
              tabsRef.current[1] = el;
            }}
            onClick={() => setActiveTab("notifications")}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-300 relative z-10 ${
              activeTab === "notifications"
                ? "text-white"
                : "text-light-bluish-gray hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4" />
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink rounded-full border-2 border-darkblue/80 z-20" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "friends" && (
        <FriendsSidebarTab
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredFriends={filteredFriends}
        />
      )}

      {activeTab === "notifications" && (
        <NotificationsTab loading={requestLoading} error={requestError} friendRequests={friendRequests} />
      )}
    </div>
  );
};

export default FriendsSidebar;
