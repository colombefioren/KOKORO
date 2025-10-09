"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const DeleteRoomModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteRoomModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-gradient-to-br from-darkblue/95 to-bluish-gray/95 rounded-3xl border border-red-500/40 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-red-500/20 border-b border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete Room</h2>
                <p className="text-light-bluish-gray text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              disabled={isLoading || isDeleting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-medium">
                This will permanently delete the room and all its contents
              </p>
              <div className="space-y-2 text-red-400/80 text-sm">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>All messages and chat history will be lost</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>All members will be removed from the room</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>This action cannot be reversed or recovered</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-white text-sm text-center font-medium">
              Are you absolutely sure you want to delete this room?
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 hover:text-white bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl py-3 font-semibold transition-all duration-300"
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || isDeleting}
              className="flex-1 bg-red-500/20 hover:bg-red-500/10 text-white rounded-xl py-3 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-lg"
            >
              {isLoading || isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Room</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-red-500 via-pink to-plum rounded-b-3xl" />
      </div>
    </div>
  );
};

export default DeleteRoomModal;
