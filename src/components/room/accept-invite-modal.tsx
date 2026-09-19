"use client";

import { useState } from "react";
import { X, Users, Crown, Calendar, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AcceptInviteModalProps {
  room: RoomRecord;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: string) => Promise<void>;
  isLoading?: boolean;
}

const AcceptInviteModal = ({
  room,
  isOpen,
  onClose,
  onJoin,
  isLoading = false,
}: AcceptInviteModalProps) => {
  const router = useRouter();

  const user = useUserStore((state) => state.user);
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin(room.id);
    } finally {
      setIsJoining(false);
    }
  };

  const isRoomFull = room.members.length >= (room.maxMembers || 30);
  const isAlreadyMember = room.members.some(
    (member) => member.userId === user?.id,
  );

  const host = room.members.find((member) => member.role === "HOST")?.user;
  const memberCount = room.members.length;
  const maxMembers = room.maxMembers || 30;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-darkblue rounded-2xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-light-royal-blue/15 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-light-royal-blue" />
            </div>
            <h2 className="text-base font-semibold text-white">Room Invite</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading || isJoining}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-1">
              {room.name}
            </h3>

            {room.description && (
              <p className="text-light-bluish-gray text-xs mb-3 leading-relaxed">
                {room.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-light-bluish-gray">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {memberCount}/{maxMembers}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-light-bluish-gray">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(room.createdAt)}</span>
              </div>
            </div>
          </div>

          {host && (
            <button
              type="button"
              onClick={() => router.push(`/profile/${host.id}`)}
              className="w-full text-left bg-white/5 hover:bg-white/8 rounded-xl p-3 border border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Image
                    src={host.image || "./placeholder.jpg"}
                    alt={host.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {host.name}
                  </p>
                  <p className="text-light-bluish-gray text-xs">Room Host</p>
                </div>
              </div>
            </button>
          )}

          {isRoomFull && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">
                This room has reached its member limit
              </p>
            </div>
          )}

          {isAlreadyMember && (
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-400 text-sm">
                You&apos;re already part of this room
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl py-2.5 text-sm font-medium"
              disabled={isLoading || isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isLoading || isJoining || isRoomFull || isAlreadyMember}
              className="flex-1 bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl py-2.5 text-sm font-medium"
            >
              {isLoading || isJoining ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                "Join Room"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInviteModal;
