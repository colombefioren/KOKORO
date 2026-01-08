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
    <div className="text-center px-2">
      {isLoading ? (
        <div className="h-6 mb-1 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-light-royal-blue rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
        <div className="text-xl font-bold text-white">{value}</div>
      )}
      <div className="text-light-bluish-gray text-xs">{label}</div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
        <div className="relative mx-auto lg:mx-0">
          <div className="relative w-24 h-24 lg:w-32 lg:h-32">
            <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full opacity-20 blur"></div>
            <Image
              src={user.image || "./placeholder.jpg"}
              alt="Profile"
              width={128}
              height={128}
              className="relative w-full h-full rounded-full border-2 border-white/20 object-cover"
            />
          </div>
        </div>

        <div className="flex-1 w-full space-y-5">
          <div className="text-center lg:text-left space-y-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white font-fredoka">
              {user.name}
            </h1>
            <p className="text-light-bluish-gray text-sm">
              @{user.username || user.displayUsername || "user"}
            </p>
          </div>

          {user.bio && (
            <p className="text-white/80 text-sm text-center lg:text-left leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          )}

          <div className="flex justify-between lg:justify-start lg:gap-12 max-w-sm mx-auto lg:mx-0">
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

          <div className="flex flex-col sm:flex-row gap-3">
            {isCurrentUser ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 hover:text-white rounded-lg bg-white/5 text-white border-white/20 hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button
                  onClick={() => router.push("/rooms/create")}
                  className="flex-1 rounded-lg bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90"
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
                  className={`flex-1 text-white ${
                    isFriend
                      ? "bg-gradient-to-r from-pink to-rose-600"
                      : "bg-gradient-to-r from-light-royal-blue to-plum"
                  }`}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {isFriend ? "Removing..." : "Adding..."}
                    </div>
                  ) : isFriend ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remove Friend
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  variant="outline"
                  className="flex-1 bg-white/5 text-white border-white/20 hover:bg-white/10"
                >
                  {isMessaging ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Opening...
                    </div>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
