import {
  Users,
  Calendar,
  MessageCircle,
  Heart,
  Lock,
  Globe,
  Users as Friends,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Room {
  id: number;
  name: string;
  type: "public" | "private" | "friends";
  description: string;
  members: number;
  maxMembers: number;
  memberAvatars: string[];
  active: boolean;
  created: string;
  isOwner: boolean;
  isInvited?: boolean;
  isFavorite?: boolean;
}

interface RoomCardProps {
  room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe className="w-3 h-3" />;
      case "private":
        return <Lock className="w-3 h-3" />;
      case "friends":
        return <Friends className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  return (
    <div className="group relative h-full flex">
      <div className="absolute -inset-1 bg-gradient-to-br from-light-royal-blue/20 to-plum/10 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-light-royal-blue/30 transition-all duration-500 flex flex-col w-full">
        <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-pink to-plum/50 rounded-bl-2xl rounded-tr-2xl translate-x-0.5 -translate-y-0.5" />

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 truncate pr-6">
              {room.name}
            </h3>
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  room.type === "public"
                    ? "bg-light-royal-blue/15 text-light-royal-blue border border-light-royal-blue/20"
                    : room.type === "private"
                    ? "bg-plum/15 text-plum border border-plum/20"
                    : "bg-green/15 text-green border border-green/20"
                }`}
              >
                {getRoomTypeIcon(room.type)}
                {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
              </span>
              {room.isInvited && (
                <span className="bg-plum/70 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  Invited
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-plum hover:bg-transparent hover:scale-110 hover:text-plum rounded-xl transition-all w-7 h-7"
          >
            <Heart
              className={`w-4 h-4 ${room.isFavorite ? "fill-plum" : ""}`}
            />
          </Button>
        </div>

        <div className="mb-3 flex-grow">
          <p className="text-light-bluish-gray leading-relaxed text-sm line-clamp-2 min-h-[2.5rem]">
            {room.description}
          </p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-light-royal-blue">
              <Users className="w-3 h-3" />
              <span className="font-medium text-white text-xs">
                {room.members}/{room.maxMembers}
              </span>
            </div>
            <div className="flex items-center gap-1 text-plum">
              <Calendar className="w-3 h-3" />
              <span className="text-light-bluish-gray text-xs">
                {new Date(room.created).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              room.active
                ? "bg-green/15 text-green border border-green/20"
                : "bg-bluish-gray/15 text-bluish-gray border border-bluish-gray/20"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                room.active ? "bg-green animate-pulse" : "bg-bluish-gray"
              }`}
            />
            {room.active ? "Live" : "Offline"}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            {room.memberAvatars.slice(0, 4).map((avatar, idx) => (
              <div key={idx} className="relative">
                <img
                  src={avatar}
                  alt="Member"
                  className="w-8 h-8 rounded-full border-2 border-darkblue shadow-md ring-1 ring-light-royal-blue/20"
                />
              </div>
            ))}
            {room.members > 4 && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-light-royal-blue to-plum text-white text-xs font-bold flex items-center justify-center border-2 border-darkblue shadow-md ring-1 ring-light-royal-blue/20">
                +{room.members - 4}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-auto">
          <Button
            className={`w-full rounded-xl py-4 text-sm font-semibold transition-all duration-300 ${
              room.active
                ? "bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                : "bg-bluish-gray/20 text-bluish-gray border border-bluish-gray/30"
            }`}
            disabled={!room.active}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {room.active ? "Join Room" : "Room Sleeping"}
          </Button>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-light-royal-blue to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default RoomCard;