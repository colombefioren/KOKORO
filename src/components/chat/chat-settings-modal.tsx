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
      toast.success("Conversation deleted");
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-darkblue rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">Chat Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400/90 text-sm leading-relaxed">
              This removes your copy of the conversation with {chatName}.
              They&apos;ll keep theirs.
            </p>
          </div>

          <Button
            onClick={handleDeleteChat}
            disabled={isDeleting}
            className="w-full bg-red-500/80 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Conversation
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            className="w-full bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl py-2.5 text-sm font-medium"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
