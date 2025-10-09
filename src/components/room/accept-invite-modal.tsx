"use client";

import { useState } from "react";
import { X, Users, Crown, Calendar, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";

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
    (member) => member.userId === user?.id
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
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-darkblue/95 to-bluish-gray/95 rounded-3xl border border-light-royal-blue/40 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-light-royal-blue/20 to-plum/20 border-b border-light-royal-blue/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <Mail className="w-6 h-6 text-light-royal-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Room Invite</h2>
                <p className="text-light-bluish-gray text-sm">
                  You have no invite yet!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-light-bluish-gray cursor-pointer hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              disabled={isLoading || isJoining}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-light-royal-blue/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-white leading-tight pr-4">
                {room.name}
              </h3>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.isActive
                    ? "bg-green/20 text-green border border-green/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {room.isActive ? "Live" : "Offline"}
              </div>
            </div>

            {room.description && (
              <p className="text-light-bluish-gray text-sm mb-4 leading-relaxed">
                {room.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-light-royal-blue">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-medium">
                    {memberCount}/{maxMembers}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-plum">
                  <Calendar className="w-4 h-4" />
                  <span className="text-light-bluish-gray">
                    {formatDate(room.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {host && (
            <div className="bg-gradient-to-r from-light-royal-blue/10 to-plum/10 rounded-2xl p-4 border border-light-royal-blue/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={host.image || "/default-avatar.png"}
                    alt={host.name}
                    className="w-12 h-12 rounded-xl border-2 border-light-royal-blue/30 object-cover"
                  />
                  <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {host.name}
                  </p>
                  <p className="text-light-bluish-gray text-xs">Room Host</p>
                  {host.username && (
                    <p className="text-light-royal-blue text-xs truncate">
                      @{host.username}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isRoomFull && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-medium">
                  Room at Capacity
                </p>
                <p className="text-red-400/80 text-xs">
                  This room has reached its maximum member limit
                </p>
              </div>
            </div>
          )}

          {isAlreadyMember && (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-amber-400 text-sm font-medium">
                  Already a Member
                </p>
                <p className="text-amber-400/80 text-xs">
                  You&apos;re already part of this room
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-white/5 hover:text-white text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl py-3 font-semibold transition-all duration-300"
              disabled={isLoading || isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={isLoading || isJoining || isRoomFull || isAlreadyMember}
              className="flex-1 bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl py-3 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >
              {isLoading || isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Get Invite</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-light-royal-blue via-plum to-pink rounded-b-3xl" />
      </div>
    </div>
  );
};

export default AcceptInviteModal;
