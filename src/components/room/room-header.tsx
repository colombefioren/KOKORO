"use client";

import { useState } from "react";
import { Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RoomRecord } from "@/types/room";
import { leaveRoom } from "@/services/rooms.service";
import { toast } from "sonner";
import LeaveRoomModal from "./leave-room-modal";

interface RoomHeaderProps {
  room: RoomRecord;
  isHost: boolean;
}

const RoomHeader = ({ room, isHost }: RoomHeaderProps) => {
  const router = useRouter();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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

          <div className="p-3 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-2xl border border-light-royal-blue/30">
            <Video className="w-6 h-6 text-light-royal-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-fredoka">
              {room.name}
            </h1>
            <p className="text-light-bluish-gray text-sm">{room.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isHost && (
            <Button
              onClick={handleEditRoom}
              className="bg-gradient-to-r from-light-royal-blue/20 to-plum/20 text-white border border-light-royal-blue/30 hover:from-light-royal-blue/30 hover:to-plum/30 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
            >
              Edit Room
            </Button>
          )}

          {!isHost && (
            <Button
              onClick={handleLeaveClick}
              className="bg-gradient-to-r from-pink/20 to-plum/20 text-pink border border-pink/30 hover:from-pink/30 hover:to-plum/30 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
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
