"use client";

import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: { id: string; name: string; image?: string | null };
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onToggle: (messageId: string, emoji: string) => void;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

const MessageReactions = ({
  messageId,
  reactions,
  onToggle,
}: MessageReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = useUserStore((state) => state.user);

  // Group reactions by emoji
  const grouped = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {Object.entries(grouped).map(([emoji, list]) => {
        const hasReacted = list.some((r) => r.userId === currentUser?.id);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(messageId, emoji)}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] border transition-all duration-200",
              hasReacted
                ? "bg-light-royal-blue/15 border-light-royal-blue/30 text-white"
                : "bg-white/5 border-white/10 text-light-bluish-gray hover:bg-white/10",
            )}
          >
            <span>{emoji}</span>
            <span>{list.length}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-light-bluish-gray hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <SmilePlus className="w-3 h-3" />
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-1.5 bg-darkblue border border-white/10 rounded-xl shadow-xl grid grid-cols-4 gap-0.5 z-20 w-max max-w-[90vw]">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onToggle(messageId, emoji);
                  setShowPicker(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-base leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
