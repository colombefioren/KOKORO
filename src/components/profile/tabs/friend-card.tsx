"use client";
import { User } from "@/types/user";
import { getStatusColor } from "../friend-list-item";
import { useRouter } from "next/navigation";

const FriendCard = ({ friend }: { friend: User }) => {
  const router = useRouter();

  const getStatusText = (status: boolean) => {
    switch (status) {
      case true:
        return "Online";
      default:
        return "Offline";
    }
  };

  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      className="relative cursor-pointer group"
    >

      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-2xl p-4 border border-light-royal-blue/30 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-105 h-48 w-48 group-hover:h-52 flex flex-col">
        <div className="text-center flex flex-col items-center justify-center flex-grow">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-all duration-500" />
            <img
              src={friend.image ?? "https://i.pravatar.cc/150?img=1"}
              alt={friend.username ?? "User Profile"}
              className="relative w-16 h-16 rounded-full border border-white shadow-lg transition-all duration-300 group-hover:scale-110 object-cover"
            />
          </div>

          <div className="mb-2 w-full">
            <h3 className="text-white font-semibold text-base truncate px-2 ">
              {friend.name}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(
                friend.isOnline
              )} group-hover:scale-125 transition-transform duration-300`}
            />
            <span className="text-light-bluish-gray text-sm group-hover:text-white transition-colors duration-300">
              {getStatusText(friend.isOnline)}
            </span>
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
