"use client";

import { useState, useEffect } from "react";
import { Search, MessageCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";
import { createChat, findOrRestoreChat } from "@/services/chats.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedUserQuery, setDebouncedUserQuery] = useState("");

  const { data: searchResults = [], loading: usersLoading } = useSearchUsers(
    debouncedUserQuery || undefined
  );

  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedUserQuery(userSearchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [userSearchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setUserSearchQuery("");
      setDebouncedUserQuery("");
    }
  }, [isOpen]);

  const handleStartChat = async (userId: string) => {
     try {
    const chat = await findOrRestoreChat(userId);
    router.push(`/messages/${chat.id}`);
    toast.success("Chat opened!");
  } catch (error) {
    toast.error((error as ApiError).error.error || "Failed to open chat");
  }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-darkblue/95 to-darkblue/50 backdrop-blur-sm rounded-2xl border border-light-royal-blue/30 shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-light-royal-blue/20">
          <h3 className="text-xl font-bold text-white font-fredoka">
            Start New Chat
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 hover:text-white rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 border-b border-light-royal-blue/20">
          <div className="relative">
            <Search className="absolute z-20 left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder-light-bluish-gray focus:bg-white/10 focus:border-light-royal-blue/30 backdrop-blur-sm transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-light-royal-blue border-t-transparent"></div>
            </div>
          ) : searchResults.length === 0 && debouncedUserQuery ? (
            <div className="text-center py-8">
              <p className="text-light-bluish-gray text-sm">No users found</p>
            </div>
          ) : searchResults.length === 0 && !debouncedUserQuery ? (
            <div className="text-center py-8">
              <p className="text-light-bluish-gray text-sm">
                Search for users to start a chat
              </p>
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-light-royal-blue/30 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                onClick={() => handleStartChat(user.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={user.image || "https://i.pravatar.cc/150?img=1"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-sm truncate">
                      {user.name}
                    </h4>
                    <p className="text-light-bluish-gray text-xs truncate">
                      @{user.username || "user"}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
