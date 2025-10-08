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
  isLoading = false 
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
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-gradient-to-br from-darkblue/95 to-bluish-gray/95 rounded-3xl border border-pink/30 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-pink/20 to-plum/20 border-b border-pink/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <LogOut className="w-6 h-6 text-pink-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Leave Room
                </h2>
                <p className="text-light-bluish-gray text-sm">
                  Confirm your decision
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              disabled={isLoading || isLeaving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-amber-400 text-sm font-medium">
                Are you sure you want to leave?
              </p>
              <p className="text-amber-400/80 text-sm leading-relaxed">
                You would need to get an invite again before being able to join this room.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {room.name}
                </h3>
                {room.description && (
                  <p className="text-light-bluish-gray text-sm leading-relaxed">
                    {room.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-light-royal-blue">
                  <Users className="w-4 h-4" />
                  <span className="text-white font-medium">
                    {memberCount} member{memberCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 hover:text-white bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl py-3 font-semibold transition-all duration-300"
              disabled={isLoading || isLeaving}
            >
              Stay in Room
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || isLeaving}
              className="flex-1 bg-gradient-to-r from-plum to-plum/70 text-white rounded-xl py-3 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >
              {(isLoading || isLeaving) ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Leaving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Leave Room</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-pink via-plum to-light-royal-blue rounded-b-3xl" />
      </div>
    </div>
  );
};

export default LeaveRoomModal;