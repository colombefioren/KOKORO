import { User } from "@/types/user";
import { UserPlus, MoreVertical } from "lucide-react";
import Image from "next/image";

interface FriendListItemProps {
  friend: User;
  showAddButton?: boolean;
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
}: FriendListItemProps) => {
  return (
    <div className="group relative p-4 bg-gradient-to-r from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-light-royal-blue/40 transition-all duration-300 cursor-pointer hover:bg-white/10 hover:shadow-lg hover:shadow-light-royal-blue/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-darkblue ${getStatusColor(
                friend.isOnline
              )} ${getStatusGlow(friend.isOnline)} shadow-lg`}
            />
            <Image
              src={friend.image ?? "https://i.pravatar.cc/150?img=1"}
              alt={friend.username ?? "User Profile Pic"}
              className="w-12 h-12 rounded-xl border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300 object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate mb-1">
              {friend.firstName} {friend.lastName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {showAddButton ? (
            <button className="p-2 bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200">
              <UserPlus className="w-4 h-4" />
            </button>
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
