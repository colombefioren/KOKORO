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

      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-2xl p-4 border border-light-royal-blue/30 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-105 h-48 w-48 group-hover:h-52 flex flex-col">
        <div className="text-center flex flex-col items-center justify-center flex-grow">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-all duration-500" />
          <Image
  src={friend.image ?? "./placeholder.jpg"}
  alt={friend.username ?? "User Profile"}
  width={64}
  height={64}
  className="relative aspect-square rounded-full border border-white shadow-lg transition-all duration-300 group-hover:scale-110 object-cover"
/>
          </div>

          <div className="mb-2 w-full">
            <h3 className="text-white font-semibold text-base truncate px-2 ">
              {friend.name}
            </h3>
          </div>
        </div>

        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
          <div className="bg-gradient-to-r from-light-royal-blue to-plum text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 shadow-lg whitespace-nowrap">
            View Profile
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
