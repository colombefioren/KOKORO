"use client";
import { Button } from "@/components/ui/button";
import { useUserRooms } from "@/hooks/rooms/useUserHostedRooms";
import { useUserFriends } from "@/hooks/users/useUserFriends";
import { User } from "@/types/user";
import {
  Share2,
  Plus,
  UserPlus,
  UserMinus,
  MessageCircle,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  declineFriendRequest,
  sendFriendRequest,
} from "@/services/friends.service";
import { useFriendRecords } from "@/hooks/users/useFriendRecords";
import { useUserStore } from "@/store/useUserStore";
import { createChat } from "@/services/chats.service";
import { ApiError } from "@/types/api";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
}

const ProfileHeader = ({ user, isCurrentUser }: ProfileHeaderProps) => {
  const { data: allFriends = [] } = useUserFriends(user.id);
  const { data: allRooms = [] } = useUserRooms(user.id);
  const { data: friendRecords = [] } = useFriendRecords();
  const currentUser = useUserStore((state) => state.user);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const stats = {
    friends: allFriends.length || 0,
    rooms: allRooms.length || 0,
    days: Math.floor(
      (new Date().setHours(0, 0, 0, 0) -
        new Date(user.createdAt).setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    ),
  };

  const isFriend = useMemo(() => {
    if (!currentUser) return false;
    return friendRecords?.some(
      (f) =>
        f.status === "ACCEPTED" &&
        ((f.requester.id === currentUser.id && f.receiver.id === user.id) ||
          (f.receiver.id === currentUser.id && f.requester.id === user.id))
    );
  }, [currentUser, user.id, friendRecords]);

  const handleFriendAction = async () => {
    if (!currentUser) return;

    try {
      setIsPending(true);
      if (isFriend) {
        const friendship = friendRecords?.find(
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
        toast.success("Friend removed!");
      } else {
        const res = await sendFriendRequest(user.id);
        if (res.error) {
          toast.error(res?.error || "Something went wrong");
          return;
        }
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
       const chat = await createChat({ type: "PRIVATE", memberIds: [user.id] });
       router.push(`/messages/${chat.id}`);
       toast.success("Chat opened!");
     } catch (error) {
       toast.error((error as ApiError).error.error || "Failed to open chat");
     }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-12">
      <div className="relative group">
        <img
          src={user.image || "https://i.pravatar.cc/300?img=32"}
          alt="Profile"
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
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.friends}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Friends
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.rooms}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Rooms
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.days}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Days
            </div>
          </div>
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
                className={`bg-gradient-to-r text-white hover:scale-105 transition-all duration-300 shadow-lg ${
                  isFriend
                    ? "bg-plum hover:from-red-600 hover:bg-plum/90"
                    : "from-light-royal-blue to-plum hover:opacity-90"
                }`}
              >
                {isPending ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : isFriend ? (
                  <UserMinus className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isFriend ? "Remove Friend" : "Add Friend"}
              </Button>
              <Button
                onClick={handleMessage}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
