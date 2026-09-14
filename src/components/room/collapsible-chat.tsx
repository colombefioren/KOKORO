"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./chat-sidebar";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";

export type ChatState = "expanded" | "collapsed" | "hidden";

interface CollapsibleChatProps {
  chatId: string | null;
  hostId: string | null;
  onSendMessage: (content: string) => void;
  currentUser: User | null;
}

const CollapsibleChat = ({
  chatId,
  hostId,
  onSendMessage,
  currentUser,
}: CollapsibleChatProps) => {
  const [chatState, setChatState] = useState<ChatState>("expanded");

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setChatState((prev) =>
          prev === "hidden" ? "expanded" : prev === "expanded" ? "collapsed" : "hidden"
        );
      }

      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!currentUser) return null;

  return (
    <>
      {/* Desktop sidebar version */}
      <div
        className={cn(
          "hidden lg:flex flex-col border-l border-light-royal-blue/20 transition-all duration-300 ease-out",
          chatState === "expanded"
            ? "w-96"
            : chatState === "collapsed"
              ? "w-12"
              : "w-0 border-l-0 overflow-hidden"
        )}
      >
        {chatState === "collapsed" ? (
          <div className="flex flex-col items-center py-4 gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatState("expanded")}
              className="w-10 h-10 text-light-royal-blue hover:text-white hover:bg-white/10 rounded-xl"
              title="Expand chat (C)"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatState("hidden")}
              className="w-10 h-10 text-light-bluish-gray hover:text-pink hover:bg-pink/10 rounded-xl"
              title="Hide chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Toggle bar */}
            <div className="flex items-center justify-end px-2 py-1 border-b border-light-royal-blue/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatState("collapsed")}
                className="w-7 h-7 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg"
                title="Collapse chat (C)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatSidebar
                hostId={hostId}
                chatId={chatId}
                onSendMessage={onSendMessage}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}
      </div>

      {/* Collapsed toggle button (when hidden on desktop) */}
      {chatState === "hidden" && (
        <div className="hidden lg:block fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setChatState("expanded")}
            className="w-12 h-12 rounded-full bg-light-royal-blue text-white shadow-lg hover:scale-110 transition-all duration-300"
            title="Open chat (C)"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default CollapsibleChat;
