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
      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-light-royal-blue/30 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02] h-[180px] sm:h-[220px] flex flex-col">
        <div className="text-center flex flex-col items-center justify-center flex-grow">
          <div className="relative inline-block mb-2 sm:mb-3">
            <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-30 transition-all duration-500" />
            <Image
              src={friend.image ?? "./placeholder.jpg"}
              alt={friend.username ?? "User Profile"}
              width={56}
              height={56}
              className="relative aspect-square rounded-full border border-white shadow-lg transition-all duration-300 group-hover:scale-110 object-cover w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>

          <div className="mb-2 w-full px-1">
            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
              {friend.name}
            </h3>
            {friend.username && (
              <p className="text-light-bluish-gray text-xs truncate mt-1">
                @{friend.username}
              </p>
            )}
          </div>
        </div>

        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
          <div className="bg-gradient-to-r from-light-royal-blue to-plum text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full border border-white/20 shadow-lg whitespace-nowrap">
            View Profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
