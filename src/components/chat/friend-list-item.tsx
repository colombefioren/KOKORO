import { Friend } from "@/types/user";
import Image from "next/image";

interface FriendListItemProps {
  friend: Friend;
  isActive: boolean;
  onClick: () => void;
}

const FriendListItem = ({ friend, isActive, onClick }: FriendListItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green";
      case "ingame":
        return "bg-light-royal-blue";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-bluish-gray";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? "bg-gradient-to-r from-light-royal-blue/20 to-plum/20 border-light-royal-blue/30 scale-105"
          : "bg-white/5 border-white/10 hover:border-light-royal-blue/30 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Image
            src={friend.avatar}
            alt={friend.name}
            width={48}
            height={48}
            className="rounded-full aspect-square border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-darkblue ${getStatusColor(
              friend.status
            )}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {friend.name}
          </h3>
          <p className="text-light-bluish-gray text-xs truncate">
            {friend.activity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FriendListItem;
