"use client";

import { Chat } from "@/types/chat";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (chatId: string) => void;
  animationDelay?: number;
  currentUserId: string;
}

const ChatListItem = ({
  chat,
  isActive,
  onSelect,
  animationDelay = 0,
  currentUserId
}: ChatListItemProps) => {



  if(!currentUserId) return null;

  const getOtherMember = () => {
    return chat.members.find((member) => member.user.id !== currentUserId)
      ?.user;
  };


  const otherMember = getOtherMember();

  if (!otherMember) return null;

  return (
    <div
      onClick={() => onSelect(chat.id)}
      className={`group relative p-4 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${
        isActive
          ? "bg-gradient-to-r from-light-royal-blue/30 to-green/20 border-light-royal-blue/30 shadow-lg"
          : "bg-white/5 border-white/10 hover:border-light-royal-blue/20 hover:bg-white/10"
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm" />
          <img
            src={otherMember.image || "https://i.pravatar.cc/150?img=1"}
            alt={otherMember.name}
            className="relative w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold text-sm truncate">
              {otherMember.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
