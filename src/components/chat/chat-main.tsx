"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message, Chat } from "@/types/chat";
import { getChatById, getMessages } from "@/services/chats.service";
import ChatSettingsButton from "./chat-settings-button";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";

interface ChatMainProps {
  currentUserId: string;
  chatId: string;
}

const ChatMain = ({ currentUserId, chatId }: ChatMainProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  useEffect(() => {
    if (socket) {
      socket.emit("join-chat", { chatId });
      console.log("a user joined the chat (front) ", chatId);
    }
  }, [socket, chatId]);

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("receive-message");
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) return;

      try {
        setIsLoading(true);
        const [chatData, chatMessages] = await Promise.all([
          getChatById(chatId),
          getMessages(chatId),
        ]);
        setActiveChat(chatData);
        setMessages(chatMessages);
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chatId]);

  const getOtherUser = () => {
    if (!activeChat) return null;
    const otherMember = activeChat.members.find(
      (member) => member.user.id !== currentUserId
    );
    return otherMember?.user;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
              <img
                src={otherUser.image || "https://i.pravatar.cc/150?img=1"}
                alt={otherUser.name}
                className="relative w-14 h-14 rounded-full border-2 border-white/20"
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-light-bluish-gray">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
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
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div
                        className={`text-xs opacity-70 mt-2 flex items-center gap-2 ${
                          isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span
                          className={`${
                            isSent ? "text-white" : "text-light-bluish-gray/70"
                          } text-xs`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
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
              disabled={isSending}
              className="h-full flex items-center bg-white/5 border-white/10 text-white placeholder-light-bluish-gray resize-none backdrop-blur-sm rounded-2xl pr-12 transition-all duration-300 focus:bg-white/10 focus:border-light-royal-blue/30 disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={!message.trim() || isSending}
            className="w-14 h-full rounded-2xl bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg relative overflow-hidden"
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

export default ChatMain;
