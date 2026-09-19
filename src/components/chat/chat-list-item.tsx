"use client";

import { Chat } from "@/types/chat";
import Image from "next/image";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (chatId: string) => void;
  animationDelay?: number;
  currentUserId: string;
}

const formatChatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return `${Math.floor(diffHr / 24)}d`;
};

const ChatListItem = ({
  chat,
  isActive,
  onSelect,
  currentUserId,
}: ChatListItemProps) => {
  if (!currentUserId) return null;

  const otherMember = chat.members.find(
    (member) => member.user.id !== currentUserId,
  )?.user;

  if (!otherMember) return null;

  const lastMessage = chat.messages?.[0];
  const preview = lastMessage?.deletedAt
    ? "Message deleted"
    : lastMessage?.content || (lastMessage?.imageUrl ? "Sent a photo" : "");

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      className={`w-full text-left p-3 rounded-xl border transition-colors ${
        isActive
          ? "bg-light-royal-blue/15 border-light-royal-blue/30"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          src={otherMember.image || "/placeholder.jpg"}
          alt=""
          width={44}
          height={44}
          className="aspect-square rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-white font-medium text-sm truncate">
              {otherMember.name}
            </h3>
            {lastMessage && (
              <span className="text-light-bluish-gray/60 text-[11px] flex-shrink-0">
                {formatChatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          {preview && (
            <p className="text-light-bluish-gray text-xs truncate mt-0.5">
              {preview}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;
