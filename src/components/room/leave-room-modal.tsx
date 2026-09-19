"use client";

import { useState } from "react";
import { X, LogOut, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";

interface LeaveRoomModalProps {
  room: RoomRecord;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const LeaveRoomModal = ({
  room,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LeaveRoomModalProps) => {
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLeaving(true);
    try {
      await onConfirm();
    } finally {
      setIsLeaving(false);
    }
  };

  const memberCount = room.members.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-darkblue rounded-2xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink/15 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-pink" />
            </div>
            <h2 className="text-base font-semibold text-white">Leave Room</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading || isLeaving}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-400/90 text-sm leading-relaxed">
              You&apos;ll need a new invite before being able to join{" "}
              {room.name} again.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-1">
              {room.name}
            </h3>
            {room.description && (
              <p className="text-light-bluish-gray text-xs leading-relaxed mb-2">
                {room.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-light-bluish-gray text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl py-2.5 text-sm font-medium"
              disabled={isLoading || isLeaving}
            >
              Stay in Room
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || isLeaving}
              className="flex-1 bg-pink hover:bg-pink/90 text-white rounded-xl py-2.5 text-sm font-medium"
            >
              {isLoading || isLeaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Leaving...</span>
                </div>
              ) : (
                "Leave Room"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRoomModal;
