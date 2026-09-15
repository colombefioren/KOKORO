"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Users, Bell } from "lucide-react";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import { useFriends } from "@/hooks/users/useFriends";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "sonner";
import { FriendRequester } from "@/types/user";
import {
  SendFriendRequestPayload,
  FriendRequestAcceptedPayload,
  FriendRemovedPayload,
} from "@/lib/socket";
import { useUserStore } from "@/store/useUserStore";

const FriendsSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "notifications">(
    "friends",
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

  const removeRequest = (friendshipId: string) => {
    setLocalRequests((prev) => prev.filter((f) => f.id !== friendshipId));
  };

  const currentUser = useUserStore((state) => state.user);
  const {
    data: friends,
    loading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends,
  } = useFriends();
  const [localFriends, setLocalFriends] = useState(friends);

  useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  const filteredFriends = useMemo(() => {
    if (!debouncedQuery) return localFriends;
    const q = debouncedQuery.toLowerCase();
    return localFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q),
    );
  }, [localFriends, debouncedQuery]);

  useEffect(() => {
    if (socket) {
      const handleReceiveFriendRequest = (data: SendFriendRequestPayload) => {
        setLocalRequests((prev) => [...prev, data.friendRequest]);
        toast.success("You received a friend request!");
      };

      const handleFriendRequestAccepted = (
        data: FriendRequestAcceptedPayload,
      ) => {
        setLocalRequests((prev) =>
          prev.filter((f) => f.id !== data.friendship.id),
        );
        refetchFriends();
      };

      const handleFriendRequestDeclined = (data: FriendRequester) => {
        setLocalRequests((prev) => prev.filter((f) => f.id !== data.id));
      };

      const handleFriendRemoved = (data: FriendRemovedPayload) => {
        if (data.to !== currentUser?.id && data.from !== currentUser?.id)
          return;
        const otherId = data.to === currentUser?.id ? data.from : data.to;
        setLocalFriends((prev) => prev.filter((f) => f.id !== otherId));
      };

      const handlePresenceChanged = (data: {
        userId: string;
        isOnline: boolean;
        lastSeenAt: string;
      }) => {
        setLocalFriends((prev) =>
          prev.map((f) =>
            f.id === data.userId
              ? { ...f, isOnline: data.isOnline, lastSeenAt: data.lastSeenAt }
              : f,
          ),
        );
      };

      socket.on("receive-friend-request", handleReceiveFriendRequest);
      socket.on("friend-request-accepted", handleFriendRequestAccepted);
      socket.on("friend-request-declined", handleFriendRequestDeclined);
      socket.on("friend-removed", handleFriendRemoved);
      socket.on("presence-changed", handlePresenceChanged);

      return () => {
        socket.off("receive-friend-request", handleReceiveFriendRequest);
        socket.off("friend-request-accepted", handleFriendRequestAccepted);
        socket.off("friend-request-declined", handleFriendRequestDeclined);
        socket.off("friend-removed", handleFriendRemoved);
        socket.off("presence-changed", handlePresenceChanged);
      };
    }
  }, [friendRequests, socket, currentUser?.id, refetchFriends]);

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
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="w-full border border-white/8 bg-darkblue rounded-2xl p-6 max-h-[75vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Connect</h2>
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

        <div className="flex-grow overflow-y-auto">
          {activeTab === "friends" && (
            <FriendsSidebarTab
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              filteredFriends={filteredFriends}
              loading={friendsLoading}
              error={friendsError}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              loading={requestLoading}
              error={requestError}
              onRemoveRequest={removeRequest}
              friendRequests={localRequests}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsSidebar;
