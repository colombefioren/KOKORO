"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Users, Bell } from "lucide-react";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";
import { useSocketStore } from "@/store/useSocketStore";

const FriendsSidebar = ({ currentUserId }: { currentUserId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "notifications">(
    "friends"
  );
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const socket = useSocketStore((state) => state.socket);

  const {
    data: friendRequests = [],
    loading: requestLoading,
    error: requestError,
  } = usePendingFriendRequests();

  const [localRequests, setLocalRequests] = useState(friendRequests);

  useEffect(() => {
    setLocalRequests(friendRequests);
  }, [friendRequests]);

  const {
    data: users = [],
    loading: usersLoading,
    error: usersError,
  } = useSearchUsers(debouncedQuery || undefined);

  useEffect(() => {
    if (socket) {
      socket.on("receive-friend-request", (data) => {
        setLocalRequests((prev) => [...prev, data.friendRequest]);
        console.log(data.friendRequest);
      });

      socket.on("friend-request-accepted", (data) => {
        setLocalRequests((prev) =>
          prev.filter((f) => f.id !== data.friendshipId)
        );
      });

      socket.on("friend-request-declined", (data) => {
        setLocalRequests((prev) =>
          prev.filter((f) => f.id !== data.friendshipId)
        );
      })

      return () => {
        socket.off("receive-friend-request");
        socket.off("friend-request-accepted");
        socket.off("friend-request-declined");
      };
    }
  }, [friendRequests, socket]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

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

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-screen flex items-center w-80 justify-between">
      <div className="w-full border border-light-royal-blue/20 rounded-2xl py-6 p-10 min-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-fredoka">
            Connect
          </h2>
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
              {localRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink rounded-full border-2 border-darkblue/80 z-20" />
              )}
            </button>
          </div>
        </div>

        {activeTab === "friends" && (
          <FriendsSidebarTab
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            filteredFriends={users}
            loading={usersLoading}
            error={usersError}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            currentUserId={currentUserId}
            loading={requestLoading}
            error={requestError}
            friendRequests={localRequests}
          />
        )}
      </div>
    </div>
  );
};

export default FriendsSidebar;
