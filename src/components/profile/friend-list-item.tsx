"use client";

import { User } from "@/types/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatLastSeen } from "@/lib/presence";

interface FriendListItemProps {
  friend: User;
  onProfileClick?: () => void;
}

const FriendListItem = ({ friend, onProfileClick }: FriendListItemProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    router.push(`/profile/${friend.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-light-royal-blue/40 transition-colors cursor-pointer hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <Image
              src={friend.image ?? "/placeholder.jpg"}
              alt={""}
              width={48}
              height={48}
              className="rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300 object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-darkblue ${
                friend.isOnline ? "bg-green" : "bg-light-bluish-gray/40"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate mb-1">
              {friend.name}
            </h3>
            <p className="text-light-bluish-gray text-xs truncate">
              {friend.isOnline ? "Online" : formatLastSeen(friend.lastSeenAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendListItem;
