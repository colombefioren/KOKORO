"use client";

import { useState } from "react";
import { Settings, Trash2, Users, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteChat } from "@/services/chats.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ChatSettingsButtonProps {
  chatId: string;
  chatName: string;
}

const ChatSettingsButton = ({ chatId, chatName }: ChatSettingsButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteChat = async () => {

    try {
      setIsDeleting(true);
      await deleteChat(chatId);
      toast.success("Chat deleted successfully");
      router.push("/messages"); 
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-light-royal-blue/30 transition-all duration-300 group"
      >
        <Settings className="w-5 h-5 text-light-bluish-gray group-hover:text-white transition-colors" />
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-darkblue/95 to-darkblue/50 backdrop-blur-sm rounded-2xl border border-light-royal-blue/30 shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-light-royal-blue/20">
              <h3 className="text-xl font-bold text-white font-fredoka">
                Chat Settings
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 hover:text-white rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
              >
                <span className="sr-only">Close</span>
                ×
              </Button>
            </div>

            <div className="p-6 border-b border-light-royal-blue/20">
              <div className="flex items-center">
                <div>
                  <h4 className="text-white font-semibold text-lg">{chatName}</h4>
                  <p className="text-light-bluish-gray text-sm">Private Chat</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
      

    
              <button
                onClick={handleDeleteChat}
                disabled={isDeleting}
                className="w-full flex cursor-pointer items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/30 hover:bg-red-500/15 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 text-left">
                  <h5 className="text-white font-semibold text-sm">
                    {isDeleting ? "Deleting..." : "Delete Chat"}
                  </h5>
                  <p className="text-light-bluish-gray text-xs">Other users will still be able to see it.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSettingsButton;