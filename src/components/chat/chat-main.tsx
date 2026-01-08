"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, Chat } from "@/types/chat";
import { getChatById, getMessages } from "@/services/chats.service";
import ChatSettingsButton from "./chat-settings-button";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";

interface ChatMainProps {
  currentUserId: string;
  chatId: string;
}

const ChatMain = ({ currentUserId, chatId }: ChatMainProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.user);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MESSAGES_PER_PAGE = 15;

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
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const startIndex = Math.max(
        0,
        messages.length - nextPage * MESSAGES_PER_PAGE
      );
      const endIndex = messages.length - page * MESSAGES_PER_PAGE;

      if (startIndex <= 0) {
        setHasMore(false);
      }

      const newMessagesToDisplay = messages.slice(
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
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

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
      const handleReceiveMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
        setDisplayedMessages((prev) => [...prev, message]);
        setShouldScrollToBottom(true);
      };

      socket.on("receive-message", handleReceiveMessage);

      return () => {
        socket.off("receive-message", handleReceiveMessage);
      };
    }
  }, [socket]);

  const getOtherUser = () => {
    if (!activeChat) return null;
    const otherMember = activeChat.members.find(
      (member) => member.user.id !== currentUserId
    );
    return otherMember?.user;
  };

  const formatMessageContent = (content: string | undefined) => {
    if (content != undefined) {
      if (content.length > 16 && !content.includes(" ")) {
        return content.slice(0, 16) + "...";
      }
      return content;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
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
    setShouldScrollToBottom(true);
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

  const otherUser = getOtherUser();

  if (!activeChat || isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-light-royal-blue rounded-full animate-bounce"></div>
        </div>
        <p className="text-light-bluish-gray mt-4">Loading chat...</p>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-light-bluish-gray">Unable to load chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-light-royal-blue/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative group">
              <Image
                src={otherUser.image || "./placeholder.jpg"}
                alt={otherUser.name}
                width={56}
                height={56}
                className="relative aspect-square rounded-full border-2 border-white/20"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {otherUser.name}
                </h2>
              </div>
            </div>
          </div>

          <ChatSettingsButton chatId={chatId} chatName={otherUser.name} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-light-bluish-gray">
              No messages yet. Start the conversation!
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
                    <div className="w-4 h-4 border-2 border-light-royal-blue/30 border-t-light-royal-blue rounded-full animate-spin" />
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
              {displayedMessages.map((msg) => {
                const isSent = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
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
                        <p className="text-sm leading-relaxed">
                          {formatMessageContent(msg.content)}
                        </p>
                        <div
                          className={`text-xs opacity-70 mt-2 flex items-center gap-2 ${
                            isSent ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`${
                              isSent
                                ? "text-white/80"
                                : "text-light-bluish-gray/70"
                            } text-xs`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      <div className="p-6 border-t border-light-royal-blue/10">
        <form onSubmit={handleSendMessage} className="flex h-14 gap-3">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="h-full flex items-center bg-white/5 border-white/10 text-white placeholder-light-bluish-gray resize-none backdrop-blur-sm rounded-2xl pr-12 transition-all duration-300 focus:bg-white/10 focus:border-light-royal-blue/30 disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim()}
            className="w-14 h-full rounded-2xl bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg relative overflow-hidden"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatMain;
