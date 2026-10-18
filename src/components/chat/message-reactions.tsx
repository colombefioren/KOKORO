"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { onePerUser } from "@/lib/reactions";

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

type OpenPanel =
  | { kind: "picker"; anchor: HTMLElement }
  | { kind: "details"; anchor: HTMLElement; filter: string | null };

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];
const VIEWPORT_MARGIN = 8;
const GAP = 6;

const MessageReactions = ({
  messageId,
  reactions,
  onToggle,
}: MessageReactionsProps) => {
  const [panel, setPanel] = useState<OpenPanel | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const currentUser = useUserStore((state) => state.user);

  const visible = onePerUser(reactions);
  const myEmoji = visible.find((r) => r.userId === currentUser?.id)?.emoji;

  const grouped = visible.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {});

  const anchor = panel?.anchor;

  useLayoutEffect(() => {
    if (!anchor || !panelRef.current) return;
    const trigger = anchor.getBoundingClientRect();
    const box = panelRef.current.getBoundingClientRect();

    const centeredLeft = trigger.left + trigger.width / 2 - box.width / 2;
    const left = Math.min(
      Math.max(centeredLeft, VIEWPORT_MARGIN),
      window.innerWidth - box.width - VIEWPORT_MARGIN,
    );

    const above = trigger.top - box.height - GAP;
    const top = above >= VIEWPORT_MARGIN ? above : trigger.bottom + GAP;

    setPosition({ top, left });
  }, [anchor, panel?.kind]);

  useEffect(() => {
    if (!anchor) return;

    const close = () => setPanel(null);
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchor.contains(target)) return;
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
  }, [anchor]);

  useEffect(() => {
    if (panel?.kind === "details" && visible.length === 0) setPanel(null);
  }, [panel?.kind, visible.length]);

  const togglePicker = () => {
    setPosition(undefined);
    setPanel((open) =>
      open?.kind === "picker" || !triggerRef.current
        ? null
        : { kind: "picker", anchor: triggerRef.current },
    );
  };

  const openDetails = (emoji: string, target: HTMLElement) => {
    setPosition(undefined);
    setPanel((open) =>
      open?.kind === "details" && open.anchor === target
        ? null
        : { kind: "details", anchor: target, filter: emoji },
    );
  };

  const setFilter = (filter: string | null) =>
    setPanel((open) => (open?.kind === "details" ? { ...open, filter } : open));

  const panelStyle = {
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    visibility: position ? ("visible" as const) : ("hidden" as const),
  };

  const detailsFilter = panel?.kind === "details" ? panel.filter : null;
  const listed = detailsFilter
    ? (grouped[detailsFilter] ?? [])
    : [...visible].sort(
        (a, b) =>
          Number(b.userId === currentUser?.id) -
          Number(a.userId === currentUser?.id),
      );

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {Object.entries(grouped).map(([emoji, list]) => {
        const hasReacted = emoji === myEmoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => openDetails(emoji, e.currentTarget)}
            aria-pressed={hasReacted}
            aria-haspopup="dialog"
            title={list.map((r) => r.user.name).join(", ")}
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] border transition-all duration-200",
              hasReacted
                ? "bg-gradient-to-r from-light-royal-blue/25 to-plum/25 border-light-royal-blue/40 text-white"
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
        type="button"
        onClick={togglePicker}
        aria-label="Add reaction"
        aria-expanded={panel?.kind === "picker"}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-light-bluish-gray hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        <SmilePlus className="w-3 h-3" />
      </button>

      {panel?.kind === "picker" &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={panelStyle}
            className="fixed z-[100001] p-1.5 bg-darkblue border border-white/10 rounded-xl shadow-2xl grid grid-cols-4 gap-0.5"
          >
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                aria-current={emoji === myEmoji}
                onClick={() => {
                  onToggle(messageId, emoji);
                  setPanel(null);
                }}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-base leading-none",
                  emoji === myEmoji &&
                    "bg-gradient-to-br from-light-royal-blue/40 to-plum/40 ring-1 ring-white/20",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>,
          document.body,
        )}

      {panel?.kind === "details" &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Reactions"
            style={panelStyle}
            className="fixed z-[100001] w-64 overflow-hidden bg-darkblue/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-white/10 p-1.5">
              <button
                type="button"
                onClick={() => setFilter(null)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  detailsFilter === null
                    ? "bg-gradient-to-r from-light-royal-blue to-plum text-white"
                    : "text-light-bluish-gray hover:bg-white/10 hover:text-white",
                )}
              >
                All {visible.length}
              </button>
              {Object.entries(grouped).map(([emoji, list]) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFilter(emoji)}
                  aria-label={`${emoji} ${list.length}`}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
                    detailsFilter === emoji
                      ? "bg-gradient-to-r from-light-royal-blue to-plum text-white"
                      : "text-light-bluish-gray hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span>{emoji}</span>
                  <span>{list.length}</span>
                </button>
              ))}
            </div>

            <ul className="max-h-60 overflow-y-auto p-1.5">
              {listed.map((reaction) => {
                const isMe = reaction.userId === currentUser?.id;
                return (
                  <li
                    key={reaction.userId}
                    className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white/5"
                  >
                    <Image
                      src={reaction.user.image || "/placeholder.jpg"}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {isMe ? "You" : reaction.user.name}
                      </p>
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggle(messageId, reaction.emoji);
                            setPanel(null);
                          }}
                          className="text-[11px] text-light-bluish-gray hover:text-pink"
                        >
                          Tap to remove
                        </button>
                      )}
                    </div>
                    <span className="text-base leading-none">
                      {reaction.emoji}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MessageReactions;
