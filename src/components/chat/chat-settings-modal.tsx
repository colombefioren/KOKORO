"use client";

import { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteChat } from "@/services/chats.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/store/useSocketStore";

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatName: string;
  isMobile?: boolean;
}

const ChatSettingsModal = ({
  isOpen,
  onClose,
  chatId,
  chatName,
  isMobile = false,
}: ChatSettingsModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);

  if (!isOpen) return null;

  const handleDeleteChat = async () => {
    try {
      setIsDeleting(true);
      await deleteChat(chatId);
      socket?.emit("delete-chat", { chatId });
      toast.success("Chat deleted successfully");
      onClose();
      router.push("/messages");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`relative bg-gradient-to-br from-darkblue/95 to-bluish-gray/95 rounded-2xl ${
          isMobile ? "w-full max-w-sm" : "w-full max-w-md"
        } border border-light-royal-blue/30 shadow-2xl overflow-hidden`}
      >
        <div className="p-6 border-b border-light-royal-blue/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white font-fredoka">
              Chat Settings
            </h3>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="w-8 h-8 hover:text-white rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-light-bluish-gray text-sm mt-1">
            Manage your conversation with {chatName}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium mb-1">
                Delete this conversation
              </p>
              <p className="text-red-400/80 text-xs">
                This action cannot be undone. All messages will be permanently
                deleted.
              </p>
            </div>
          </div>

          <Button
            onClick={handleDeleteChat}
            disabled={isDeleting}
            className="w-full bg-red-500/20 hover:bg-red-500/10 text-white border border-red-500/30 hover:border-red-500/40 rounded-xl py-4 font-semibold transition-all duration-300 group"
          >
            <div className="flex items-center justify-center gap-3">
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span>{isDeleting ? "Deleting..." : "Delete Conversation"}</span>
            </div>
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl py-4 font-semibold transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
