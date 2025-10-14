"use client";
import { Button } from "@/components/ui/button";
import { useUserRooms } from "@/hooks/rooms/useUserHostedRooms";
import { useUserFriends } from "@/hooks/users/useUserFriends";
import { FriendRecord, User } from "@/types/user";
import { Share2, Plus, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  declineFriendRequest,
  sendFriendRequest,
} from "@/services/friends.service";
import { useFriendRecords } from "@/hooks/users/useFriendRecords";
import { useUserStore } from "@/store/useUserStore";
import { createChat } from "@/services/chats.service";
import { ApiError } from "@/types/api";
import { useSocketStore } from "@/store/useSocketStore";
import Image from "next/image";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
}

const ProfileHeader = ({ user, isCurrentUser }: ProfileHeaderProps) => {
  const { data: allFriends = [], loading: friendsLoading } = useUserFriends(
    user.id
  );
  const { data: allRooms = [], loading: roomsLoading } = useUserRooms(user.id);
  const { data: friendRecords = [] } = useFriendRecords();
  const currentUser = useUserStore((state) => state.user);
  const [isPending, setIsPending] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const [isFriend, setIsFriend] = useState(false);
  const [localFriendRecords, setLocalFriendRecords] = useState<FriendRecord[]>(
    []
  );

  useEffect(() => {
    setLocalFriendRecords(friendRecords);
  }, [friendRecords]);

  useEffect(() => {
    const isFriend = () => {
      if (!currentUser) return false;
      return localFriendRecords?.some(
        (f) =>
          f.status === "ACCEPTED" &&
          ((f.requester.id === currentUser.id && f.receiver.id === user.id) ||
            (f.receiver.id === currentUser.id && f.requester.id === user.id))
      );
    };
    setIsFriend(isFriend());
  }, [currentUser, user.id, localFriendRecords]);

  const [localStats, setLocalStats] = useState({
    friends: allFriends.length || 0,
    rooms: allRooms.length || 0,
    days: Math.floor(
      (new Date().setHours(0, 0, 0, 0) -
        new Date(user.createdAt).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    ),
  });

  useEffect(() => {
    setLocalStats((prev) => ({
      ...prev,
      friends: allFriends.length || 0,
      rooms: allRooms.length || 0,
    }));
  }, [allFriends, allRooms]);

  const router = useRouter();

  useEffect(() => {
    if (socket) {
      const handleFriendRemoved = ({
        friendship,
      }: {
        to: string;
        from: string;
        friendship: FriendRecord;
      }) => {
        setLocalStats((prev) => ({
          ...prev,
          friends: Math.max(prev.friends - 1, 0),
        }));
        setIsFriend(false);
        setLocalFriendRecords((prev) =>
          prev.filter((f) => f.id !== friendship.id)
        );
      };

      const handleFriendRequestAccepted = (data: {
        friend: User;
        friendship: FriendRecord;
        to: string;
        from: string;
      }) => {
        setLocalStats((prev) => ({ ...prev, friends: prev.friends + 1 }));
        setIsFriend(true);
        setLocalFriendRecords((prev) => [...prev, data.friendship]);
        toast.success("Friend request accepted!");
      };

      socket.on("friend-request-accepted", handleFriendRequestAccepted);
      socket.on("friend-removed", handleFriendRemoved);

      return () => {
        socket.off("friend-request-accepted", handleFriendRequestAccepted);
        socket.off("friend-removed", handleFriendRemoved);
      };
    }
  }, [socket, user.id]);

  const handleFriendAction = async () => {
    if (!currentUser) return;

    try {
      setIsPending(true);
      if (isFriend) {
        const friendship = localFriendRecords?.find(
          (f) =>
            f.status === "ACCEPTED" &&
            ((f.requester.id === currentUser.id && f.receiver.id === user.id) ||
              (f.receiver.id === currentUser.id && f.requester.id === user.id))
        );

        if (!friendship) {
          toast.error("Friendship record not found");
          return;
        }

        const res = await declineFriendRequest(user.id);
        if (res.error) {
          toast.error(res?.error || "Something went wrong");
          return;
        }
        socket?.emit("remove-friend", {
          to: user.id,
          from: currentUser.id,
          friendship,
        });
        toast.success("Friend removed!");
      } else {
        const res = await sendFriendRequest(user.id);
        if (res.error) {
          toast.error(res?.error || "Something went wrong");
          return;
        }
        socket?.emit("send-friend-request", {
          receiverId: user.id,
          friendRequest: res,
        });
        toast.success("Friend request sent!");
      }
    } catch {
      toast.error(`Failed to ${isFriend ? "remove" : "add"} friend`);
    } finally {
      setIsPending(false);
    }
  };

  const handleMessage = async () => {
    try {
      setIsMessaging(true);
      const chat = await createChat({ type: "PRIVATE", memberIds: [user.id] });
      router.push(`/messages/${chat.id}`);
      toast.success("Chat opened!");
      socket?.emit("open-chat", { chat, to: user.id, from: currentUser?.id });
    } catch (error) {
      toast.error((error as ApiError).error.error || "Failed to open chat");
    } finally {
      setIsMessaging(false);
    }
  };

  const StatItem = ({
    value,
    label,
    isLoading,
  }: {
    value: number;
    label: string;
    isLoading: boolean;
  }) => (
    <div className="text-center">
      {isLoading ? (
        <div className="flex justify-center mb-1">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      <div className="text-light-bluish-gray text-sm font-medium">{label}</div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-12">
      <div className="relative group">
        <Image
          src={user.image || "./placeholder.jpg"}
          alt="Profile"
          width={112}
          height={112}
          className="relative border border-white w-28 h-28 lg:w-36 lg:h-36 rounded-full"
        />
      </div>

      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-2xl font-bold text-white font-fredoka">
            {user.name}
          </h1>
          <p className="text-light-bluish-gray text-sm">
            @{user.username || user.displayUsername || "user"}
          </p>
        </div>

        <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
          {user.bio || ""}
        </p>

        <div className="flex flex-wrap gap-8">
          <StatItem
            value={localStats.friends}
            label="Friends"
            isLoading={friendsLoading}
          />
          <StatItem
            value={localStats.rooms}
            label="Rooms"
            isLoading={roomsLoading}
          />
          <StatItem
            value={localStats.days}
            label="Days"
            isLoading={roomsLoading || friendsLoading}
          />
        </div>

        <div className="flex flex-wrap gap-5 pt-2">
          {isCurrentUser ? (
            <>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
              <Button
                onClick={() => {
                  router.push("/rooms/create");
                }}
                className="bg-gradient-to-r hover:text-white from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleFriendAction}
                disabled={isPending}
                className={`bg-gradient-to-r text-white hover:scale-105 transition-all duration-300 shadow-lg relative overflow-hidden ${
                  isFriend
                    ? "bg-plum hover:from-red-600 hover:bg-plum/90"
                    : "from-light-royal-blue to-plum hover:opacity-90"
                } disabled:opacity-50 disabled:scale-100`}
              >
                {isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  </div>
                ) : isFriend ? (
                  <UserMinus className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isPending ? (
                  <span className="flex items-center">
                    {isFriend ? "Removing..." : "Adding..."}
                  </span>
                ) : isFriend ? (
                  "Remove Friend"
                ) : (
                  "Send Friend Request"
                )}

                {isPending && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-light-royal-blue to-plum animate-pulse opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] transform -skew-x-12" />
                  </div>
                )}
              </Button>
              <Button
                onClick={handleMessage}
                disabled={isMessaging}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:scale-100"
              >
                {isMessaging ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  </div>
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                {isMessaging ? "Opening..." : "Message"}

                {isMessaging && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-white/10 animate-pulse opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_infinite] transform -skew-x-12" />
                  </div>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
