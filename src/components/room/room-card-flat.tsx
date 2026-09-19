"use client";

import { useState } from "react";
import { Heart, Lock, Globe, Users as FriendsIcon } from "lucide-react";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import AcceptInviteModal from "./accept-invite-modal";
import { joinRoom, toggleRoomFavorite } from "@/services/rooms.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { useSocketStore } from "@/store/useSocketStore";
import Image from "next/image";

const TYPE_META: Record<
  RoomRecord["type"],
  { label: string; color: string; icon: typeof Globe }
> = {
  PUBLIC: { label: "Public", color: "#287eae", icon: Globe },
  PRIVATE: { label: "Private", color: "#874c62", icon: Lock },
  FRIENDS: { label: "Friends", color: "#217574", icon: FriendsIcon },
};

const RoomCardFlat = ({ room }: { room: RoomRecord }) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const userMember = room.members.find((m) => m.userId === user?.id);
  const isMember = !!userMember;
  const isFavorite = userMember?.isFavorite ?? false;
  const canJoin =
    !isMember && (room.type === "PUBLIC" || room.type === "FRIENDS");
  const isRoomFull =
    !isMember && room.members.length >= (room.maxMembers || 30);
  const meta = TYPE_META[room.type];
  const TypeIcon = meta.icon;

  const handleCardClick = () => {
    if (isMember) {
      router.push(`/rooms/${room.id}`);
    } else if (canJoin && !isRoomFull) {
      setIsModalOpen(true);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavoriting) return;
    setIsFavoriting(true);
    try {
      const updatedMember = await toggleRoomFavorite(room.id);
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      socket?.emit("toggle-favorite", updatedMember);
    } catch {
      toast.error("Failed to update favorite");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(true);
    try {
      await joinRoom(roomId);
      if (user) socket?.emit("member-joined-room", { roomId, user });
      toast.success("You're in! Redirecting to the room...");
      router.push(`/rooms/${roomId}`);
    } catch (error) {
      toast.error((error as ApiError).error.error || "Failed to join room");
    } finally {
      setIsJoining(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCardClick}
        disabled={isRoomFull}
        className="text-left w-full rounded-2xl bg-darkblue border border-white/8 overflow-hidden hover:border-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div
          className="relative h-28 flex items-center justify-center"
          style={{
            backgroundColor: room.thumbnailUrl ? undefined : `${meta.color}22`,
          }}
        >
          {room.thumbnailUrl ? (
            <Image
              src={room.thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
              className="object-cover"
            />
          ) : (
            <TypeIcon className="w-7 h-7" style={{ color: meta.color }} />
          )}

          {isMember && (
            <button
              type="button"
              onClick={handleFavoriteClick}
              disabled={isFavoriting}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center"
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorite ? "fill-pink text-pink" : "text-white"}`}
              />
            </button>
          )}

          <span
            className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${meta.color}dd`, color: "#fff" }}
          >
            {meta.label}
          </span>
        </div>

        <div className="p-3 space-y-2">
          <h3 className="text-white font-semibold text-sm truncate">
            {room.name}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {room.members.slice(0, 3).map((m) => (
                <Image
                  key={m.userId}
                  src={m.user.image || "./placeholder.jpg"}
                  alt=""
                  width={18}
                  height={18}
                  className="rounded-full border border-darkblue object-cover"
                />
              ))}
            </div>
            <span className="text-[11px] text-light-bluish-gray">
              {room.members.length} here
            </span>
            {isRoomFull ? (
              <span className="text-[11px] text-pink/80 ml-auto">Full</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-green ml-auto" />
            )}
          </div>
        </div>
      </button>

      <AcceptInviteModal
        room={room}
        isOpen={isModalOpen}
        isLoading={isJoining}
        onClose={() => !isJoining && setIsModalOpen(false)}
        onJoin={handleJoinRoom}
      />
    </>
  );
};

export default RoomCardFlat;
