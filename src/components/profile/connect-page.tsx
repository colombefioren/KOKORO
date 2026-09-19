"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, Bell, Loader, UserPlus, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import FriendsSidebarTab from "./tabs/friends-sidebar-tab";
import NotificationsTab from "./tabs/notifications-tab";
import { useFriends } from "@/hooks/users/useFriends";
import { usePendingFriendRequests } from "@/hooks/users/usePendingFriendRequests";
import { useFriendRecords } from "@/hooks/users/useFriendRecords";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { FriendRequester } from "@/types/user";
import { searchUsers } from "@/services/user.service";
import { sendFriendRequest } from "@/services/friends.service";
import {
  SendFriendRequestPayload,
  FriendRequestAcceptedPayload,
  FriendRemovedPayload,
} from "@/lib/socket";

interface PersonResult {
  id: string;
  name: string;
  image: string | null;
  username?: string | null;
}

const PeopleResults = ({
  query,
  results,
  isSearching,
  disabledIds,
  onAdd,
}: {
  query: string;
  results: PersonResult[];
  isSearching: boolean;
  disabledIds: Set<string>;
  onAdd: (userId: string) => void;
}) => {
  if (!query.trim() || query.trim().length < 2) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/8">
      <h3 className="text-[11px] uppercase tracking-wider text-light-bluish-gray/60 font-medium mb-3">
        People
      </h3>

      {isSearching && (
        <div className="flex justify-center py-6">
          <Loader className="w-5 h-5 text-light-royal-blue animate-spin" />
        </div>
      )}

      {!isSearching && results.length === 0 && (
        <p className="text-light-bluish-gray text-sm text-center py-4">
          No people match &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      {!isSearching && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {results.map((person) => {
            const isSent = disabledIds.has(person.id);
            return (
              <div
                key={person.id}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-darkblue flex-shrink-0">
                  {person.image ? (
                    <Image
                      src={person.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-semibold">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {person.name}
                  </p>
                  {person.username && (
                    <p className="text-light-bluish-gray text-xs truncate">
                      @{person.username}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(person.id)}
                  disabled={isSent}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isSent
                      ? "bg-green/15 text-green"
                      : "bg-light-royal-blue text-white hover:bg-light-royal-blue/90",
                  )}
                  aria-label={isSent ? "Request sent" : "Add friend"}
                >
                  {isSent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ConnectPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!searchQuery.trim()) return localFriends;
    const q = searchQuery.trim().toLowerCase();
    return localFriends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q),
    );
  }, [localFriends, searchQuery]);

  const { data: friendRecords = [] } = useFriendRecords();

  const pendingUserIds = useMemo(() => {
    const ids = new Set<string>();
    friendRecords.forEach((f) => {
      if (f.status !== "PENDING") return;
      if (f.requester.id === currentUser?.id) ids.add(f.receiver.id);
      else if (f.receiver.id === currentUser?.id) ids.add(f.requester.id);
    });
    return ids;
  }, [friendRecords, currentUser?.id]);

  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [peopleResults, setPeopleResults] = useState<PersonResult[]>([]);
  const [isSearchingPeople, setIsSearchingPeople] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setPeopleResults([]);
      return;
    }

    let cancelled = false;
    setIsSearchingPeople(true);
    const timeout = setTimeout(() => {
      searchUsers(q)
        .then((users: PersonResult[]) => {
          if (cancelled) return;
          const friendIds = new Set(localFriends.map((f) => f.id));
          setPeopleResults(users.filter((u) => !friendIds.has(u.id)));
        })
        .catch(() => {
          if (!cancelled) setPeopleResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsSearchingPeople(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, localFriends]);

  const handleAddFriend = async (userId: string) => {
    if (!currentUser) return;
    try {
      const res = await sendFriendRequest(userId);
      if (res.error) {
        toast.error(res.error || "Something went wrong");
        return;
      }
      setSentIds((prev) => new Set(prev).add(userId));
      socket?.emit("send-friend-request", {
        receiverId: userId,
        friendRequest: res,
      });
      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send friend request");
    }
  };

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
          <>
            <FriendsSidebarTab
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              filteredFriends={filteredFriends}
              loading={friendsLoading}
              error={friendsError}
            />
            <PeopleResults
              query={searchQuery}
              results={peopleResults}
              isSearching={isSearchingPeople}
              disabledIds={new Set([...sentIds, ...pendingUserIds])}
              onAdd={handleAddFriend}
            />
          </>
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
