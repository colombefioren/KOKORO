"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  ChevronUp,
  ChevronLeft,
  MoreVertical,
  Loader,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, Chat } from "@/types/chat";
import { getChatById, getMessages } from "@/services/chats.service";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ChatSettingsModal from "./chat-settings-modal";
import MessageReactions from "./message-reactions";
import { toast } from "sonner";

interface ChatMainProps {
  currentUserId: string;
  chatId: string;
  isMobile?: boolean;
  onBack?: () => void;
}

const ChatMain = ({
  currentUserId,
  chatId,
  isMobile = false,
  onBack,
}: ChatMainProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null,
  );
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const MESSAGES_PER_PAGE = 15;

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const startIndex = Math.max(
        0,
        messages.length - nextPage * MESSAGES_PER_PAGE,
      );
      const endIndex = messages.length - page * MESSAGES_PER_PAGE;

      if (startIndex <= 0) {
        setHasMore(false);
      }

      const newMessagesToDisplay = messages.slice(
        Math.max(0, startIndex),
        endIndex,
      );

      const previousScrollHeight =
        messagesContainerRef.current?.scrollHeight || 0;

      setDisplayedMessages((prev) => [...newMessagesToDisplay, ...prev]);
      setPage(nextPage);

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight;
          messagesContainerRef.current.scrollTop = scrollDifference;
        }
      }, 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, messages, page]);

  const loadInitialMessages = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const [chatData, chatMessages] = await Promise.all([
        getChatById(chatId),
        getMessages(chatId),
      ]);
      setActiveChat(chatData);
      setMessages(chatMessages);

      const startIndex = Math.max(0, chatMessages.length - MESSAGES_PER_PAGE);
      const initialMessages = chatMessages.slice(startIndex);
      setDisplayedMessages(initialMessages);
      setHasMore(startIndex > 0);
      setPage(1);

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, scrollToBottom]);

  useEffect(() => {
    if (socket) {
      socket.emit("join-chat", { chatId });
    }
  }, [socket, chatId]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (newMessage: Message) => {
        setMessages((prev) => [...prev, newMessage]);
        setDisplayedMessages((prev) => [...prev, newMessage]);

        setTimeout(() => {
          scrollToBottom();
        }, 50);
      };

      const handleMessageDeleted = (data: {
        chatId: string;
        messageId: string;
      }) => {
        if (data.chatId !== chatId) return;
        const markDeleted = (m: Message) =>
          m.id === data.messageId
            ? {
                ...m,
                content: undefined,
                imageUrl: null,
                deletedAt: new Date().toISOString(),
              }
            : m;
        setMessages((prev) => prev.map(markDeleted));
        setDisplayedMessages((prev) => prev.map(markDeleted));
      };

      const handleReactionToggled = (data: {
        chatId: string;
        messageId: string;
        emoji: string;
        userId: string;
        userName: string;
        userImage: string | null;
        action: "added" | "removed";
      }) => {
        if (data.chatId !== chatId) return;
        if (data.userId === currentUserId) return;

        const applyReaction = (m: Message) => {
          if (m.id !== data.messageId) return m;
          const reactions = m.reactions ?? [];
          if (data.action === "added") {
            if (
              reactions.some(
                (r) => r.emoji === data.emoji && r.userId === data.userId,
              )
            )
              return m;
            return {
              ...m,
              reactions: [
                ...reactions,
                {
                  id: `${data.messageId}-${data.userId}-${data.emoji}`,
                  emoji: data.emoji,
                  userId: data.userId,
                  user: {
                    id: data.userId,
                    name: data.userName,
                    image: data.userImage,
                  },
                },
              ],
            };
          }
          return {
            ...m,
            reactions: reactions.filter(
              (r) => !(r.emoji === data.emoji && r.userId === data.userId),
            ),
          };
        };

        setMessages((prev) => prev.map(applyReaction));
        setDisplayedMessages((prev) => prev.map(applyReaction));
      };

      socket.on("receive-message", handleReceiveMessage);
      socket.on("message-deleted", handleMessageDeleted);
      socket.on("reaction-toggled", handleReactionToggled);

      return () => {
        socket.off("receive-message", handleReceiveMessage);
        socket.off("message-deleted", handleMessageDeleted);
        socket.off("reaction-toggled", handleReactionToggled);
      };
    }
  }, [socket, scrollToBottom, chatId, currentUserId]);

  const handleDeleteMessage = async (
    messageId: string,
    scope: "me" | "both",
  ) => {
    try {
      const res = await fetch(
        `/api/chats/${chatId}/messages/${messageId}?scope=${scope}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete message");

      if (scope === "me") {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        setDisplayedMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        socket?.emit("delete-message", { chatId, messageId });
        const markDeleted = (m: Message) =>
          m.id === messageId
            ? {
                ...m,
                content: undefined,
                imageUrl: null,
                deletedAt: new Date().toISOString(),
              }
            : m;
        setMessages((prev) => prev.map(markDeleted));
        setDisplayedMessages((prev) => prev.map(markDeleted));
      }
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error("Failed to toggle reaction");
      const result: { action: "added" | "removed" } = await res.json();

      const applyReaction = (m: Message) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ?? [];
        if (result.action === "added") {
          return {
            ...m,
            reactions: [
              ...reactions,
              {
                id: `${messageId}-${currentUserId}-${emoji}`,
                emoji,
                userId: currentUserId,
                user: currentUser,
              },
            ],
          };
        }
        return {
          ...m,
          reactions: reactions.filter(
            (r) => !(r.emoji === emoji && r.userId === currentUserId),
          ),
        };
      };

      setMessages((prev) => prev.map(applyReaction));
      setDisplayedMessages((prev) => prev.map(applyReaction));
      socket?.emit("toggle-reaction", { chatId, messageId, emoji });
    } catch {
      toast.error("Failed to react to message");
    }
  };

  const getOtherUser = () => {
    if (!activeChat) return null;
    const otherMember = activeChat.members.find(
      (member) => member.user.id !== currentUserId,
    );
    return otherMember?.user;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    const messagePayload = {
      id: crypto.randomUUID(),
      chatId,
      content: message,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      sender: currentUser,
    };

    setMessage("");
    socket?.emit("send-message", messagePayload);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoadMore = async () => {
    await loadMoreMessages();
  };

  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatName = (name: string) => {
    if (name.length > 15) {
      return name.slice(0, 15) + "...";
    }
    return name;
  };

  const otherUser = getOtherUser();

  if (!currentUser) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/messages");
    }
  };

  if (isLoading && displayedMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[400px]">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Loader className="w-12 sm:w-16 h-12 sm:h-16 text-light-royal-blue animate-spin"></Loader>
          </div>
          <p className="text-light-bluish-gray mt-4 text-sm">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (!activeChat || !otherUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-2">
            Unable to load chat
          </h3>
          <p className="text-light-bluish-gray text-xs sm:text-sm mb-6 max-w-sm">
            The conversation could not be loaded. Please try again.
          </p>
          <Button
            onClick={handleBack}
            className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
          >
            {isMobile ? "Back to chats" : "Go Back"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-darkblue/40 to-bluish-gray/20">
        <div className="sticky top-0 z-10 p-3 sm:p-4 border-b border-light-royal-blue/20 bg-darkblue/90 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {isMobile && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 hover:bg-white/10 rounded-xl"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>
              )}

              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-light-royal-blue/20 to-plum/20 p-0.5">
                    <Image
                      src={otherUser.image || "./placeholder.jpg"}
                      alt={otherUser.name}
                      width={isMobile ? 32 : 40}
                      height={isMobile ? 32 : 40}
                      className="w-full h-full rounded-full border-2 border-darkblue object-cover"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-white font-semibold text-sm sm:text-base truncate">
                    {formatName(otherUser.name)}
                  </h2>
                  <p className="text-light-bluish-gray text-xs truncate">
                    {otherUser.username
                      ? `@${otherUser.username.length > 20 ? otherUser.username.slice(0, 20) + "..." : otherUser.username}`
                      : "Online"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="ghost"
              size="icon"
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 hover:bg-white/10 rounded-xl ml-2"
              aria-label="Chat settings"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-light-bluish-gray" />
            </Button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
        >
          {hasMore && (
            <div className="flex justify-center mb-3 sm:mb-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="ghost"
                className="text-xs text-light-bluish-gray hover:text-white hover:bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 border-2 border-light-royal-blue/30 border-t-light-royal-blue rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <ChevronUp className="w-3 h-3" />
                    <span className="text-xs">Load more messages</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-light-bluish-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">
                Start the conversation
              </h3>
              <p className="text-light-bluish-gray text-xs sm:text-sm max-w-xs">
                Send your first message to {otherUser.name.split(" ")[0]}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {displayedMessages.map((msg) => {
                const isSent = msg.senderId === currentUserId;
                const showSenderName =
                  !isSent &&
                  (displayedMessages.length === 0 ||
                    msg.senderId !==
                      displayedMessages[displayedMessages.indexOf(msg) - 1]
                        ?.senderId);

                const isDeleted = Boolean(msg.deletedAt);

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-center gap-1.5 ${
                      isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    {isSent && !isDeleted && (
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMessageMenuId(
                              openMessageMenuId === msg.id ? null : msg.id,
                            )
                          }
                          className="p-1.5 rounded-lg text-light-bluish-gray hover:text-white hover:bg-white/10"
                          aria-label="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {openMessageMenuId === msg.id && (
                          <div className="absolute right-0 bottom-full mb-1 bg-darkblue border border-white/10 rounded-xl shadow-xl overflow-hidden z-10 w-40">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMessageMenuId(null);
                                handleDeleteMessage(msg.id, "me");
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10"
                            >
                              Delete for me
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMessageMenuId(null);
                                handleDeleteMessage(msg.id, "both");
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-pink hover:bg-white/10"
                            >
                              Delete for everyone
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="max-w-[90%] xs:max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%] xl:max-w-[55%]">
                      <div
                        className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 relative ${
                          isDeleted
                            ? "bg-white/5 text-light-bluish-gray/70 italic"
                            : isSent
                              ? "bg-light-royal-blue text-white rounded-br-md"
                              : "bg-white/10 text-white rounded-bl-md"
                        }`}
                      >
                        {showSenderName && !isSent && (
                          <div className="mb-1">
                            <span className="text-xs font-medium text-light-bluish-gray truncate">
                              {formatName(
                                msg.sender.username || msg.sender.name,
                              )}
                            </span>
                          </div>
                        )}

                        <p className="text-sm break-words whitespace-pre-wrap">
                          {isDeleted ? "This message was deleted" : msg.content}
                        </p>

                        <div
                          className={`mt-1.5 sm:mt-2 flex ${
                            isSent ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-xs ${
                              isSent
                                ? "text-white/70"
                                : "text-light-bluish-gray/70"
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>

                      {!isDeleted && (
                        <MessageReactions
                          messageId={msg.id}
                          reactions={msg.reactions ?? []}
                          onToggle={handleToggleReaction}
                        />
                      )}
                    </div>

                    {!isSent && !isDeleted && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id, "me")}
                        className="p-1.5 rounded-lg text-light-bluish-gray hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete message for me"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 p-3 sm:p-4 border-t border-light-royal-blue/20 bg-darkblue/90 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="flex-1 min-w-0">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${formatName(
                  otherUser.name.split(" ")[0],
                )}...`}
                className="w-full bg-white/5 border-white/10 text-white placeholder-light-bluish-gray rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm focus:border-light-royal-blue focus:bg-white/10 transition-all duration-300"
                aria-label="Type your message"
              />
            </div>
            <Button
              type="submit"
              disabled={!message.trim()}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-light-royal-blue text-white hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </form>
        </div>
      </div>

      <ChatSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chatId={chatId}
        chatName={otherUser.name}
        isMobile={isMobile}
      />
    </>
  );
};

export default ChatMain;
