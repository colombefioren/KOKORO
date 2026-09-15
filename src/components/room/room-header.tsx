"use client";

import { useState } from "react";
import { Video, ArrowLeft, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RoomRecord } from "@/types/room";
import { leaveRoom } from "@/services/rooms.service";
import { toast } from "sonner";
import LeaveRoomModal from "./leave-room-modal";
import { useSocketStore } from "@/store/useSocketStore";

interface RoomHeaderProps {
  room: RoomRecord;
  isHost: boolean;
}

const RoomHeader = ({ room, isHost }: RoomHeaderProps) => {
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleToggleMode = () => {
    if (!socket) return;
    const nextMode =
      room.mode === "FREE_FOR_ALL" ? "HOST_CONTROLLED" : "FREE_FOR_ALL";
    socket.emit("change-room-mode", { roomId: room.id, mode: nextMode });
  };

  const handleEditRoom = () => {
    router.push(`/rooms/${room.id}/edit`);
  };

  const handleLeaveClick = () => {
    setIsLeaveModalOpen(true);
  };

  const handleLeaveConfirm = async () => {
    setIsLeaving(true);
    try {
      await leaveRoom(room.id);
      toast.success("You have left the room");
      setIsLeaveModalOpen(false);
      router.push("/");
    } catch (error) {
      toast.error("Failed to leave room");
      console.error("Failed to leave room:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLeaving) {
      setIsLeaveModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-light-royal-blue/20">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/")}
            className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="p-3 sm:block hidden bg-light-royal-blue/10 rounded-2xl border border-light-royal-blue/20">
            <Video className="w-6 h-6 text-light-royal-blue" />
          </div>
          <div className="sm:block hidden">
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <p className="text-light-bluish-gray text-sm">{room.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isHost && (
            <Button
              onClick={handleToggleMode}
              title={
                room.mode === "FREE_FOR_ALL"
                  ? "Anyone can control playback. Click to restrict to host only."
                  : "Only the host controls playback. Click to let everyone control it."
              }
              className="bg-white/5 text-white border border-white/15 hover:bg-white/10 rounded-xl px-4 py-3 transition-all duration-300"
            >
              {room.mode === "FREE_FOR_ALL" ? (
                <Users className="w-4 h-4 mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              {room.mode === "FREE_FOR_ALL"
                ? "Free for all"
                : "Host controlled"}
            </Button>
          )}

          {isHost && (
            <Button
              onClick={handleEditRoom}
              className="bg-light-royal-blue/15 text-white border border-light-royal-blue/30 hover:bg-light-royal-blue/25 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              Edit Room
            </Button>
          )}

          {!isHost && (
            <Button
              onClick={handleLeaveClick}
              className="bg-pink/15 text-pink border border-pink/30 hover:bg-pink/25 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              Leave Room
            </Button>
          )}
        </div>
      </div>

      <LeaveRoomModal
        room={room}
        isOpen={isLeaveModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleLeaveConfirm}
        isLoading={isLeaving}
      />
    </>
  );
};

export default RoomHeader;
