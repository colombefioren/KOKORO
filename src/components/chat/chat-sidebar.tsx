"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, UserPlus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { usePrivateChats } from "@/hooks/chats/usePrivateChats";
import ChatListItem from "./chat-list-item";
import NewChatModal from "./new-chat-modal";
import { Chat } from "@/types/chat";
import { useSocketStore } from "@/store/useSocketStore";

interface ChatSidebarProps {
  currentUserId: string;
  activeChatId?: string;
}

const ChatSidebar = ({ activeChatId, currentUserId }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
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

  const handleChatSelect = (chatId: string) => {
    router.push(`/messages/${chatId}`);
  };

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
      <div className="w-80 md:flex hidden flex-col border-r border-white/10">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            <div className="relative">
              <button
                onClick={() => setModalOpen(true)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-light-bluish-gray hover:text-white" />
              </button>

              {showTooltip && (
                <div className="absolute z-50 top-full right-0 mt-1 bg-darkblue border border-white/10 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap">
                  Start new chat
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-darkblue border border-white/10 text-white placeholder-light-bluish-gray/50 rounded-xl text-sm focus:border-light-royal-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 text-light-royal-blue animate-spin" />
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <ChatListItem
                currentUserId={currentUserId || ""}
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onSelect={() => handleChatSelect(chat.id)}
                animationDelay={index * 100}
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

export default ChatSidebar;
