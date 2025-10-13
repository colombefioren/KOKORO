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
        prevChats.filter((c) => c.id !== chatId)
      );
    };

    socket.on("receive-chat", handleReceiveChat);
    socket.on("chat-deleted", handleRemoveChat);

    return () => {
      socket.off("receive-chat", handleReceiveChat);
    };
  }, [socket]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/messages/${chatId}`);
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return localPrivateChats;

    return localPrivateChats.filter((chat) => {
      const otherMember = chat.members.find(
        (member) => member.user.id !== currentUserId
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
      <div className="w-80 md:flex hidden flex-col border-r border-light-royal-blue/10">
        <div className="p-6 border-b border-light-royal-blue/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-white">Messages</h2>
            </div>
            <div className="relative">
              <button
                onClick={() => setModalOpen(true)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="group cursor-pointer relative p-2 rounded-xl bg-gradient-to-r from-light-royal-blue/10 to-plum/10 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300"
              >
                <UserPlus className="w-5 h-5 text-light-bluish-gray group-hover:text-white transition-colors" />
                <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue/20 to-plum/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </button>

              {showTooltip && (
                <div className="absolute z-50 -top-1 -right-15 transform translate-x-1/2 bg-darkblue border border-light-royal-blue/30 text-white text-xs py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                  Start new chat
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder-light-bluish-gray focus:bg-white/10 focus:border-light-royal-blue/30 backdrop-blur-sm transition-all duration-300"
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
