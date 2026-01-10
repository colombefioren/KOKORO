"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageSquare, Crown, Send, ChevronUp, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";
import { Message } from "@/types/chat";
import { getMessages } from "@/services/chats.service";
import { useSocketStore } from "@/store/useSocketStore";

interface ChatSidebarProps {
  chatId: string | null;
  hostId: string | null;
  onSendMessage: (content: string) => void;
  currentUser: User | null;
  isMobile?: boolean;
}

const ChatSidebar = ({
  chatId,
  hostId,
  onSendMessage,
  currentUser,
}: ChatSidebarProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MESSAGES_PER_PAGE = 15;

  const socket = useSocketStore((state) => state.socket);

  const scrollToBottom = useCallback(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const loadMoreMessages = useCallback(async () => {
    if (!chatId || !hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const allMessages = await getMessages(chatId);
      const nextPage = page + 1;
      const startIndex = Math.max(
        0,
        allMessages.length - nextPage * MESSAGES_PER_PAGE
      );
      const endIndex = allMessages.length - page * MESSAGES_PER_PAGE;

      if (startIndex <= 0) {
        setHasMore(false);
      }

      const newMessagesToDisplay = allMessages.slice(
        Math.max(0, startIndex),
        endIndex
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
  }, [chatId, hasMore, isLoading, page]);

  const loadInitialMessages = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const allMessages = await getMessages(chatId);

      const startIndex = Math.max(0, allMessages.length - MESSAGES_PER_PAGE);
      const initialMessages = allMessages.slice(startIndex);
      setDisplayedMessages(initialMessages);
      setHasMore(startIndex > 0);
      setPage(1);
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit("join-chat", { chatId });
    }
  }, [socket, chatId]);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (message: Message) => {
        setDisplayedMessages((prev) => [...prev, message]);
        setShouldScrollToBottom(true);
      };

      socket.on("receive-message", handleReceiveMessage);

      return () => {
        socket.off("receive-message", handleReceiveMessage);
      };
    }
  }, [socket]);

  if (!currentUser) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      onSendMessage(newMessage);
      setNewMessage("");
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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

  const formatMessageContent = (content: string | undefined) => {
    if (content != undefined) {
      if (content.length > 16 && !content.includes(" ")) {
        return content.slice(0, 16) + "...";
      }
      return content;
    }
  };

  const formatSenderName = (name: string) => {
    if (name.length > 20) {
      return name.slice(0, 20) + "...";
    }
    return name;
  };

  return (
    <div className="lg:w-96 w-full h-full border-l border-light-royal-blue/20 bg-gradient-to-b from-darkblue/40 to-bluish-gray/20 backdrop-blur-sm flex flex-col shadow-2xl pb-safe">
      <div className="p-6 border-b border-light-royal-blue/20 bg-gradient-to-r from-darkblue/50 to-bluish-gray/30">
        <h2 className="text-xl font-bold text-white font-fredoka flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-xl border border-light-royal-blue/30">
            <MessageSquare className="w-5 h-5 text-light-royal-blue" />
          </div>
          Live Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6" ref={messagesContainerRef}>
        {!chatId || (isLoading && displayedMessages.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce"></div>
            </div>
            <p className="text-light-bluish-gray mt-4 text-sm">
              Loading messages...
            </p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center mb-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  variant="ghost"
                  className="text-xs text-light-bluish-gray hover:text-white hover:bg-white/5 px-3 py-1 rounded-full"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 text-light-royal-blue animate-spin" />
                  ) : (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Load more messages
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {displayedMessages.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-light-bluish-gray text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                displayedMessages.map((message) => {
                  const isSent = message.senderId === currentUser?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isSent ? "justify-end" : "justify-start"
                      } group`}
                    >
                      <div className="relative">
                        <div
                          className={`relative max-w-md rounded-3xl px-6 py-4 border backdrop-blur-sm transition-all duration-500 ${
                            isSent
                              ? "bg-gradient-to-r from-light-royal-blue to-plum text-white border-white rounded-br-md shadow-lg"
                              : "bg-white/10 text-white border-white/10 rounded-bl-md shadow-lg"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold text-sm flex items-center gap-2">
                              {formatSenderName(
                                message.sender.username ||
                                  message.sender.name.split(" ")[0]
                              )}
                              {message.sender.id === hostId && (
                                <Crown
                                  className={`w-3 h-3 ${
                                    isSent
                                      ? "text-white"
                                      : "text-light-royal-blue"
                                  }`}
                                />
                              )}
                            </span>
                            <span
                              className={`${
                                isSent
                                  ? "text-white/80"
                                  : "text-light-bluish-gray/70"
                              } text-xs`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-white text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {formatMessageContent(message.content)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-light-royal-blue/20 bg-gradient-to-r from-darkblue/40 to-bluish-gray/20">
        <form onSubmit={handleSendMessage} className="flex h-14 gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isSending}
              className="h-full flex items-center bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray rounded-2xl pr-12 transition-all duration-300 focus:bg-white/10 focus:border-light-royal-blue focus:ring-2 focus:ring-light-royal-blue/20 disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-14 h-full rounded-2xl bg-gradient-to-r from-light-royal-blue to-plum text-white hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg relative overflow-hidden"
          >
            {isSending ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <Send className="w-5 h-5" />
            )}

            {isSending && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-light-royal-blue to-plum animate-pulse opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] transform -skew-x-12" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidebar;
