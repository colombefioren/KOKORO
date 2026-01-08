"use client";

import { User } from "@/types/user";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FriendCard = ({ friend }: { friend: User }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      className="relative cursor-pointer group"
    >
      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-light-royal-blue/40 shadow-sm hover:shadow-md transition-all duration-300 h-[140px] sm:h-[160px] flex flex-col">
        <div className="text-center flex flex-col items-center justify-center flex-grow">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-300" />
            <Image
              src={friend.image ?? "./placeholder.jpg"}
              alt={friend.username ?? "User Profile"}
              width={56}
              height={56}
              className="relative aspect-square rounded-full border border-white/30 shadow-md transition-transform duration-300 group-hover:scale-105 object-cover w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>

          <div className="mb-2 w-full px-1">
            <h3 className="text-white font-medium text-sm truncate">
              {friend.name}
            </h3>
            {friend.username && (
              <p className="text-light-bluish-gray/80 text-xs truncate mt-1">
                @{friend.username}
              </p>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gradient-to-r from-light-royal-blue to-plum text-white text-xs font-medium px-2 py-1 rounded-full border border-white/20 shadow-md">
            View Profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
