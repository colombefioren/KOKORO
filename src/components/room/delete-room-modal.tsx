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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-darkblue rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Delete Room
              </h2>
              <p className="text-light-bluish-gray text-xs">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading || isDeleting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-red-400/90 text-sm">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>All messages will be lost</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span>All members will be removed</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>This cannot be reversed</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              onClick={onClose}
              className="flex-1 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl py-2.5 text-sm font-medium"
              disabled={isLoading || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || isDeleting}
              className="flex-1 bg-red-500/80 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium"
            >
              {isLoading || isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Room"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomModal;
