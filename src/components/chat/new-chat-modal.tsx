"use client";

import { useState, useEffect } from "react";
import { Search, MessageCircle, X, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchUsers } from "@/hooks/users/useSearchUsers";
import { findOrRestoreChat } from "@/services/chats.service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { useSocketStore } from "@/store/useSocketStore";
import Image from "next/image";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const NewChatModal = ({
  isOpen,
  onClose,
  currentUserId,
}: NewChatModalProps) => {
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [debouncedUserQuery, setDebouncedUserQuery] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const socket = useSocketStore((state) => state.socket);

  const { data: searchResults = [], loading: usersLoading } = useSearchUsers(
    debouncedUserQuery || undefined,
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
      setLoadingUserId(null);
    }
  }, [isOpen]);

  const handleStartChat = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const chat = await findOrRestoreChat(userId);
      socket?.emit("open-chat", { chat, to: userId, from: currentUserId });
      router.push(`/messages/${chat.id}`);
      toast.success("Chat opened!");
    } catch (error) {
      toast.error((error as ApiError).error.error || "Failed to open chat");
    } finally {
      setLoadingUserId(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-darkblue rounded-2xl border border-white/10 shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">Start New Chat</h3>
          <button
            onClick={onClose}
            disabled={!!loadingUserId}
            className="p-1.5 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute z-20 left-3 top-1/2 -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              disabled={!!loadingUserId}
              className="pl-10 bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl text-sm focus:border-light-royal-blue disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {usersLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="w-6 h-6 text-light-royal-blue animate-spin mb-2" />
              <p className="text-light-bluish-gray text-sm">
                Searching users...
              </p>
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
              <button
                type="button"
                key={user.id}
                className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                  loadingUserId === user.id
                    ? "bg-white/10 border-light-royal-blue/40"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => !loadingUserId && handleStartChat(user.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Image
                    src={user.image || "/placeholder.jpg"}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="rounded-full aspect-square object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">
                      {user.name}
                    </h4>
                    <p className="text-light-bluish-gray text-xs truncate">
                      @{user.username || "user"}
                    </p>
                  </div>
                </div>

                {loadingUserId === user.id ? (
                  <Loader className="w-4 h-4 text-light-royal-blue animate-spin flex-shrink-0" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-light-bluish-gray flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
