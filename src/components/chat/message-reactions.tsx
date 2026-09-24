"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
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
const VIEWPORT_MARGIN = 8;
const GAP = 6;

const MessageReactions = ({
  messageId,
  reactions,
  onToggle,
}: MessageReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const currentUser = useUserStore((state) => state.user);

  const grouped = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  useLayoutEffect(() => {
    if (!showPicker || !triggerRef.current || !pickerRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const picker = pickerRef.current.getBoundingClientRect();

    const centeredLeft = trigger.left + trigger.width / 2 - picker.width / 2;
    const left = Math.min(
      Math.max(centeredLeft, VIEWPORT_MARGIN),
      window.innerWidth - picker.width - VIEWPORT_MARGIN,
    );

    const above = trigger.top - picker.height - GAP;
    const top = above >= VIEWPORT_MARGIN ? above : trigger.bottom + GAP;

    setPosition({ top, left });
  }, [showPicker]);

  useEffect(() => {
    if (!showPicker) return;

    const close = () => setShowPicker(false);
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        pickerRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      )
        return;
      close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [showPicker]);

  const togglePicker = () => {
    setPosition(undefined);
    setShowPicker((open) => !open);
  };

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

      <button
        ref={triggerRef}
        onClick={togglePicker}
        aria-label="Add reaction"
        aria-expanded={showPicker}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-light-bluish-gray hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        <SmilePlus className="w-3 h-3" />
      </button>

      {showPicker &&
        createPortal(
          <div
            ref={pickerRef}
            role="menu"
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? "visible" : "hidden",
            }}
            className="fixed z-[100001] p-1.5 bg-darkblue border border-white/10 rounded-xl shadow-2xl grid grid-cols-4 gap-0.5"
          >
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                role="menuitem"
                onClick={() => {
                  onToggle(messageId, emoji);
                  setShowPicker(false);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-base leading-none"
              >
                {emoji}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MessageReactions;
