"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePrivateChats } from "@/hooks/chats/usePrivateChats";
import { Chat } from "@/types/chat";
import ChatListItem from "./chat-list-item";

interface ChatSidebarProps {
  currentUserId: string;
  activeChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
}

const ChatSidebar = ({ activeChat, onChatSelect , currentUserId}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: privateChats = [] } = usePrivateChats();

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return privateChats;

    return privateChats.filter((chat) => {
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
  }, [currentUserId, privateChats, searchQuery]);

  return (
    <div className="w-80 flex flex-col border-r border-light-royal-blue/10">
      <div className="p-6 border-b border-light-royal-blue/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-white">Messages</h2>
          </div>
          <button className="group cursor-pointer relative p-2 rounded-xl bg-gradient-to-r from-light-royal-blue/10 to-plum/10 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300">
            <UserPlus className="w-5 h-5 text-light-bluish-gray group-hover:text-white transition-colors" />
            <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue/20 to-plum/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </button>
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
        {filteredChats.map((chat, index) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            isActive={activeChat?.id === chat.id}
            onSelect={onChatSelect}
            animationDelay={index * 100}
          />
        ))}

        {filteredChats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-light-bluish-gray text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
