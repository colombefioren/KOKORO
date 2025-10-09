import {
  declineFriendRequest,
  sendFriendRequest,
} from "@/services/friends.service";
import { FriendRecord, User } from "@/types/user";
import { UserPlus, MoreVertical, Loader, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface FriendListItemProps {
  friend: User;
  showAddButton?: boolean;
  friendRecords?: FriendRecord[];
  currentUserId: string;
}

export const getStatusColor = (status: boolean) => {
  switch (status) {
    case true:
      return "bg-green";
    default:
      return "bg-light-royal-blue";
  }
};

export const getStatusGlow = (status: boolean) => {
  switch (status) {
    case true:
      return "shadow-green/20";
    default:
      return "shadow-light-royal-blue/20";
  }
};

const FriendListItem = ({
  friend,
  showAddButton = false,
  friendRecords,
  currentUserId,
}: FriendListItemProps) => {
  const [isPending, setIsPending] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const isFriend = useMemo(() => {
    return friendRecords?.some(
      (f) =>
        f.status === "ACCEPTED" &&
        ((f.requester.id === currentUserId && f.receiver.id === friend.id) ||
          (f.receiver.id === currentUserId && f.requester.id === friend.id))
    );
  }, [currentUserId, friend.id, friendRecords]);

  const handleAddFriend = async () => {
    try {
      setIsPending(true);
      const res = await sendFriendRequest(friend.id);
      if (res.error) {
        toast.error(res?.error || "Something went wrong");
        setIsPending(false);
        return;
      }
      toast.success("Friend request sent!");
    } catch {
      toast.error("Failed to send friend request");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      setIsPending(true);
      const friendship = friendRecords?.find(
        (f) =>
          f.status === "ACCEPTED" &&
          ((f.requester.id === currentUserId && f.receiver.id === friend.id) ||
            (f.receiver.id === currentUserId && f.requester.id === friend.id))
      );

      if (!friendship) {
        toast.error("Friendship record not found");
        return;
      }

      const res = await declineFriendRequest(friend.id);
      if (res.error) {
        toast.error(res?.error || "Something went wrong");
        setIsPending(false);
        return;
      }
      toast.success("Friend removed!");
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setIsPending(false);
    }
  };

  const getTooltipText = () => {
    if (isPending) return "";
    return isFriend ? "Remove friend" : "Add friend";
  };

  const handleButtonClick = () => {
    if (isFriend) {
      handleRemoveFriend();
    } else {
      handleAddFriend();
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      className="group relative p-4 bg-gradient-to-r from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-light-royal-blue/40 transition-all duration-300 cursor-pointer hover:bg-white/10 hover:shadow-lg hover:shadow-light-royal-blue/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-darkblue ${getStatusColor(
                friend.isOnline
              )} ${getStatusGlow(friend.isOnline)} shadow-lg`}
            />
            <img
              src={friend.image ?? "https://i.pravatar.cc/150?img=1"}
              alt={friend.username ?? "User Profile Pic"}
              className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300 object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate mb-1">
              {friend.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {showAddButton ? (
            <div className="relative">
              {showTooltip && !isPending && (
                <div className="absolute z-50 -top-10 -right-12 transform -translate-x-1/2 bg-darkblue border border-light-royal-blue/30 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                  {getTooltipText()}
                  <div className="absolute bottom-0 right-1/6 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-darkblue border-b border-r border-light-royal-blue/30 rotate-45"></div>
                </div>
              )}

              <button
                disabled={isPending}
                onClick={handleButtonClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`p-2 cursor-pointer text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200 relative ${
                  isFriend
                    ? "bg-gradient-to-r from-red-500 to-pink-500"
                    : "bg-gradient-to-r from-light-royal-blue to-plum"
                }`}
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : isFriend ? (
                  <UserMinus className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <button className="p-2 bg-white/10 text-light-bluish-gray rounded-xl hover:bg-white/20 hover:text-white transition-all duration-200">
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendListItem;
