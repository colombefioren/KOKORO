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
    <div className=" relative">
      <div className="absolute -inset-2 bg-gradient-to-br from-light-royal-blue/20 to-plum/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-darkblue/90 to-bluish-gray/70 backdrop-blur-sm rounded-2xl p-6 border border-light-royal-blue/30 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-105">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-2 bg-gradient-to-br from-light-royal-blue to-plum rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-all duration-500" />
            <img
              src={friend.avatar}
              alt={friend.name}
              className="relative w-20 h-20 rounded-full border border-white shadow-lg transition-all duration-300 group-hover:scale-110"
            />
          </div>

          <h3 className="text-white font-semibold text-lg mb-1">
            {friend.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor(
                friend.status
              )}`}
            />
            <span className="text-light-bluish-gray text-sm">
              {getStatusText(friend.status)}
            </span>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="w-10 hover:text-white h-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-110 transition-all duration-300"
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
