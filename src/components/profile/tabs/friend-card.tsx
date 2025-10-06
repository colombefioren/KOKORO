import { MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/user";

interface FriendCardProps {
  friend: Friend;
}

const FriendCard = ({ friend }: FriendCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green";
      case "ingame":
        return "bg-light-royal-blue";
      case "dnd":
        return "bg-plum";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-bluish-gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "ingame":
        return "In a Room";
      case "dnd":
        return "Do Not Disturb";
      case "idle":
        return "Away";
      default:
        return "Offline";
    }
  };

  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue/20 to-plum/10 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-2xl p-4 border border-light-royal-blue/30 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-105 h-full flex flex-col">
        <div className="text-center flex flex-col items-center flex-grow">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-all duration-500" />
            <img
              src={friend.avatar}
              alt={friend.name}
              className="relative w-16 h-16 rounded-full border border-white shadow-lg transition-all duration-300 group-hover:scale-110"
            />
          </div>

          {/* Truncated name with fixed height */}
          <div className="mb-2 w-full min-h-[2.5rem] flex items-center justify-center">
            <h3 className="text-white font-semibold text-base truncate max-w-full px-2">
              {friend.name}
            </h3>
          </div>
          
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(
                friend.status
              )}`}
            />
            <span className="text-light-bluish-gray text-sm">
              {getStatusText(friend.status)}
            </span>
          </div>

          {/* Buttons pushed to bottom */}
          <div className="flex justify-center gap-2 mt-auto">
            <Button
              size="icon"
              variant="outline"
              className="w-9 hover:text-white h-9 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="w-9 h-9 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-110 transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;