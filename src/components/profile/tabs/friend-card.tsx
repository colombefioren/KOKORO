"use client";

import { User } from "@/types/user";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FriendCard = ({
  friend,
  onProfileClick,
}: {
  friend: User;
  onProfileClick?: () => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    router.push(`/profile/${friend.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left bg-darkblue rounded-xl p-4 border border-white/10 hover:border-light-royal-blue/40 transition-colors h-[140px] sm:h-[160px] flex flex-col"
    >
      <div className="text-center flex flex-col items-center justify-center flex-grow">
        <div className="relative inline-block mb-3">
          <Image
            src={friend.image ?? "/placeholder.jpg"}
            alt=""
            width={56}
            height={56}
            className="aspect-square rounded-full border border-white/10 object-cover w-12 h-12 sm:w-14 sm:h-14"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-darkblue ${
              friend.isOnline ? "bg-green" : "bg-light-bluish-gray/40"
            }`}
          />
        </div>

        <div className="mb-2 w-full px-1">
          <h3 className="text-white font-medium text-sm truncate">
            {friend.name}
          </h3>
          {friend.username && (
            <p className="text-light-bluish-gray/70 text-xs truncate mt-1">
              @{friend.username}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default FriendCard;
