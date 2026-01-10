"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Bell, X } from "lucide-react";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MobileFriendsSidebarProps {
  onProfileClick?: () => void;
}

const MobileFriendsSidebar = ({
  onProfileClick,
}: MobileFriendsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "notifications">(
    "friends"
  );
  const [isOpen, setIsOpen] = useState(false);
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

  const removeRequest = (friendshipId: string) => {
    setLocalRequests((prev) => prev.filter((f) => f.id !== friendshipId));
  };

  const {
    data: users = [],
    loading: usersLoading,
    error: usersError,
  } = useSearchUsers(debouncedQuery || undefined);

  useEffect(() => {
    if (socket) {
      socket.on("receive-friend-request", (data) => {
        setLocalRequests((prev) => [...prev, data.friendRequest]);
        toast.success("You received a friend request!");
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
      });

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
          size="icon"
        >
          <Users className="w-6 h-6 transition-transform group-hover:scale-110" />
        </Button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          lg:hidden fixed top-0 right-0 h-full w-80 bg-darkblue/95
          border-l border-light-royal-blue/30 backdrop-blur-xl z-50
          shadow-2xl shadow-black/30
          transition-transform duration-500 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-light-royal-blue/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-fredoka">
                  Connect
                </h2>
                <p className="text-sm text-light-bluish-gray/80 mt-1">
                  Stay connected with friends
                </p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </Button>
            </div>

            <div className="relative flex gap-1 bg-gradient-to-br from-light-royal-blue/20 to-plum/20 rounded-xl p-1.5 border border-light-royal-blue/30">
              <div
                className="absolute bottom-1.5 top-1.5 rounded-xl transition-all duration-500 ease-out bg-gradient-to-r from-light-royal-blue to-plum"
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
                className={`flex-1 py-3 rounded-xl cursor-pointer transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                  activeTab === "friends"
                    ? "text-white"
                    : "text-light-bluish-gray hover:text-white/90"
                }`}
              >
                <Users className="w-4.5 h-4.5 transition-transform" />
                <span className="text-sm font-medium">Friends</span>
              </button>

              <button
                ref={(el) => {
                  tabsRef.current[1] = el;
                }}
                onClick={() => setActiveTab("notifications")}
                className={`flex-1 py-3 rounded-xl cursor-pointer transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                  activeTab === "notifications"
                    ? "text-white"
                    : "text-light-bluish-gray hover:text-white/90"
                }`}
              >
                <div className="relative">
                  <Bell className="w-4.5 h-4.5 transition-transform" />
                  {localRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink to-rose-500 rounded-full flex items-center justify-center z-20 ">
                      <span className="text-[10px] font-bold text-white">
                        {localRequests.length}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Notifs</span>
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-light-royal-blue/30 scrollbar-track-transparent">
            {activeTab === "friends" && (
              <FriendsSidebarTab
                searchQuery={searchQuery}
                setSearchQuery={handleSearchChange}
                filteredFriends={users}
                loading={usersLoading}
                error={usersError}
                onProfileClick={handleProfileClick}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                loading={requestLoading}
                error={requestError}
                onRemoveRequest={removeRequest}
                friendRequests={localRequests}
                onProfileClick={handleProfileClick}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFriendsSidebar;
