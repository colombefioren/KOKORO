"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePrivateChats } from "@/hooks/chats/usePrivateChats";
import ChatListItem from "./chat-list-item";
import NewChatModal from "./new-chat-modal";
import { Chat } from "@/types/chat";
import { useSocketStore } from "@/store/useSocketStore";
import { useEffect } from "react";

interface MobileChatListProps {
  currentUserId: string;
  onSelectChat: (chatId: string) => void;
  onClose?: () => void;
}

const MobileChatList = ({
  currentUserId,
  onSelectChat,
  onClose,
}: MobileChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const { data: privateChats = [], loading } = usePrivateChats();

  const [localPrivateChats, setLocalPrivateChats] = useState<Chat[]>([]);

  useEffect(() => {
    setLocalPrivateChats(privateChats);
  }, [privateChats]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveChat = (chat: Chat) => {
      setLocalPrivateChats((prevChats) => {
        const exists = prevChats.some((c) => c.id === chat.id);
        if (exists) return prevChats;
        return [...prevChats, chat];
      });
    };

    const handleRemoveChat = (chatId: string) => {
      setLocalPrivateChats((prevChats) =>
        prevChats.filter((c) => c.id !== chatId),
      );
    };

    socket.on("receive-chat", handleReceiveChat);
    socket.on("chat-deleted", handleRemoveChat);

    return () => {
      socket.off("receive-chat", handleReceiveChat);
      socket.off("chat-deleted", handleRemoveChat);
    };
  }, [socket]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return localPrivateChats;

    return localPrivateChats.filter((chat) => {
      const otherMember = chat.members.find(
        (member) => member.user.id !== currentUserId,
      );
      if (!otherMember) return false;

      return (
        otherMember.user.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        otherMember.user.username
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    });
  }, [currentUserId, localPrivateChats, searchQuery]);

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="p-4 border-b border-white/10 bg-darkblue">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onClose && (
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </Button>
              )}
              <h2 className="text-xl font-semibold text-white">Messages</h2>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-light-bluish-gray" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute z-50 left-3 top-1/2 -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl text-sm focus:border-light-royal-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce"></div>
              </div>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                currentUserId={currentUserId || ""}
                chat={chat}
                isActive={false}
                onSelect={() => onSelectChat(chat.id)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-light-bluish-gray text-sm">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        currentUserId={currentUserId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default MobileChatList;
