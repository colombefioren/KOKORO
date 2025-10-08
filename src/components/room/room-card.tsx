"use client";

import { useState } from "react";
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
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import AcceptInviteModal from "./accept-invite-modal";
import { joinRoom, toggleRoomFavorite } from "@/services/rooms.service";
import { toast } from "sonner";

interface RoomCardProps {
  room: RoomRecord;
  onFavoriteToggle?: () => void; 
}

const RoomCard = ({ room, onFavoriteToggle }: RoomCardProps) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(room.isFavorite);

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case "PUBLIC":
        return <Globe className="w-3 h-3" />;
      case "PRIVATE":
        return <Lock className="w-3 h-3" />;
      case "FRIENDS":
        return <Friends className="w-3 h-3" />;
      default:
        return <Globe className="w-3 h-3" />;
    }
  };

  const isMember = room.members.some((member) => member.userId === user?.id);
  const isInvited = room.members.some(
    (member) => member.userId === user?.id && member.role === "MEMBER"
  );

  const isHost = room.members.some(
    (member) => member.userId === user?.id && member.role === "HOST"
  );

  const canJoin =
    !isMember && (room.type === "PUBLIC" || room.type === "FRIENDS");

  const isRoomFull = !isHost && room.members.length >= (room.maxMembers || 30);

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMember) {
      router.push(`/rooms/${room.id}`);
    } else if ((canJoin || isHost) && !isRoomFull) {
      setIsModalOpen(true);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavoriting) return;
    
    setIsFavoriting(true);
    try {
      await toggleRoomFavorite(room.id);
      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      onFavoriteToggle?.(); 
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite");
    } finally {
      setIsFavoriting(false);
    }
  };

  const getButtonText = () => {
    if (isMember) return "Enter Room";
    if (isRoomFull && !isHost) return "Room Full";
    if (!canJoin && !isHost) return "Private Room";
    return "Join Room";
  };

  const isButtonDisabled = isRoomFull && !isHost;

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(true);
    try {
      await joinRoom(roomId);
      toast.success("Invite granted! You can now join the room!");
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      toast.error(error.error.error || "Failed to join room here");
    } finally {
      setIsJoining(false);
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    if (!isJoining) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
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
                    room.type === "PUBLIC"
                      ? "bg-light-royal-blue/15 text-light-royal-blue border border-light-royal-blue/20"
                      : room.type === "PRIVATE"
                      ? "bg-plum/15 text-plum border border-plum/20"
                      : "bg-green/15 text-green border border-green/20"
                  }`}
                >
                  {getRoomTypeIcon(room.type)}
                  {room.type.charAt(0).toUpperCase() +
                    room.type.slice(1).toLowerCase()}
                </span>
                {isInvited && (
                  <span className="bg-plum/70 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    Invited
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              className="text-plum hover:bg-transparent hover:scale-110 hover:text-plum rounded-xl transition-all w-7 h-7"
            >
              {isFavoriting ? (
                <div className="w-4 h-4 border-2 border-plum/30 border-t-plum rounded-full animate-spin" />
              ) : (
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${
                    isFavorite ? "fill-plum scale-110" : ""
                  }`}
                />
              )}
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
                  {room.members.length}/{room.maxMembers}
                </span>
              </div>
              <div className="flex items-center gap-1 text-plum">
                <Calendar className="w-3 h-3" />
                <span className="text-light-bluish-gray text-xs">
                  {new Date(room.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                room.isActive
                  ? "bg-green/15 text-green border border-green/20"
                  : "bg-amber-500/15 text-amber-500 border border-amber-500/20"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  room.isActive ? "bg-green animate-pulse" : "bg-amber-500/30"
                }`}
              />
              {room.isActive ? "Live" : "Offline"}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex -space-x-2">
              {room.members.slice(0, 4).map((m, idx) => (
                <div key={m.userId} className="relative">
                  <img
                    src={m.user.image ?? ""}
                    alt={m.user.name || "Member"}
                    className="w-8 h-8 rounded-full border-2 border-darkblue shadow-md ring-1 ring-light-royal-blue/20"
                  />
                </div>
              ))}
              {room.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-light-royal-blue to-plum text-white text-xs font-bold flex items-center justify-center border-2 border-darkblue shadow-md ring-1 ring-light-royal-blue/20">
                  +{room.members.length - 4}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-auto">
            <Button
              onClick={handleJoinClick}
              disabled={isButtonDisabled}
              className={`w-full rounded-xl py-4 text-sm font-semibold transition-all duration-300 ${
                isButtonDisabled
                  ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-light-royal-blue to-transparent rounded-full" />
        </div>
      </div>

      {canJoin && !isMember && (
        <AcceptInviteModal
          room={room}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onJoin={handleJoinRoom}
          isLoading={isJoining}
        />
      )}
    </>
  );
};

export default RoomCard;