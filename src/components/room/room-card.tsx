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
    <div className="group relative">
      <div className="absolute -inset-2 bg-gradient-to-br from-light-royal-blue/20 to-plum/10 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-pink to-plum/50 rounded-bl-2xl rounded-tr-2xl translate-x-1 -translate-y-1" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-ebony mb-2 truncate pr-2">
              {room.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
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
                <span className="bg-plum/70 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                  Invited
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-plum hover:bg-transparent hover:scale-120 hover:text-plum rounded-xl transition-all"
          >
            <Heart
              className={`w-5 h-5 ${room.isFavorite ? "fill-plum" : ""}`}
            />
          </Button>
        </div>

        <p className="text-blush-gray mb-5 leading-relaxed text-sm line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-light-royal-blue">
              <Users className="w-4 h-4" />
              <span className="font-medium text-ebony">
                {room.members}/{room.maxMembers}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-plum">
              <Calendar className="w-4 h-4" />
              <span className="text-ebony/70">
                {new Date(room.created).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              room.active
                ? "bg-green/15 text-green border border-green/20"
                : "bg-bluish-gray/15 text-bluish-gray border border-bluish-gray/20"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                room.active ? "bg-green animate-pulse" : "bg-bluish-gray"
              }`}
            />
            {room.active ? "Live" : "Offline"}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex -space-x-3">
            {room.memberAvatars.slice(0, 4).map((avatar, idx) => (
              <div key={idx} className="relative">
                <img
                  src={avatar}
                  alt="Member"
                  className="w-10 h-10 rounded-full border-3 border-white shadow-lg ring-2 ring-light-royal-blue/20"
                />
              </div>
            ))}
            {room.members > 4 && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-light-royal-blue to-plum text-white text-xs font-bold flex items-center justify-center border-3 border-white shadow-lg ring-2 ring-light-royal-blue/20">
                +{room.members - 4}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            className={`w-full rounded-xl py-6 text-base font-semibold transition-all duration-300 ${
              room.active
                ? "bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                : "bg-bluish-gray/20 text-bluish-gray border border-bluish-gray/30"
            }`}
            disabled={!room.active}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {room.active ? "Join Room" : "Room Sleeping"}
          </Button>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-light-royal-blue to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default RoomCard;
