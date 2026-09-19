"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import { useFriends } from "@/hooks/users/useFriends";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { FriendRequester } from "@/types/user";
import {
  SendFriendRequestPayload,
  FriendRequestAcceptedPayload,
  FriendRemovedPayload,
} from "@/lib/socket";

const ConnectPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.user);

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
    if (!socket) return;

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
      if (data.to !== currentUser?.id && data.from !== currentUser?.id) return;
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
  }, [socket, currentUser?.id, refetchFriends]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="flex-1 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Connect
          </h1>
          <p className="text-light-bluish-gray text-sm">
            Your friends and pending requests
          </p>
        </div>

        <div className="flex gap-1.5 bg-darkblue border border-white/10 rounded-xl p-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("friends")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === "friends"
                ? "bg-light-royal-blue text-white"
                : "text-light-bluish-gray hover:text-white",
            )}
          >
            <Users className="w-4 h-4" />
            Friends
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === "requests"
                ? "bg-light-royal-blue text-white"
                : "text-light-bluish-gray hover:text-white",
            )}
          >
            <Bell className="w-4 h-4" />
            Requests
            {localRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                {localRequests.length > 9 ? "9+" : localRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-darkblue p-4 sm:p-6">
        {activeTab === "friends" ? (
          <FriendsSidebarTab
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            filteredFriends={filteredFriends}
            loading={friendsLoading}
            error={friendsError}
          />
        ) : (
          <NotificationsTab
            loading={requestLoading}
            error={requestError}
            onRemoveRequest={removeRequest}
            friendRequests={localRequests}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectPage;
