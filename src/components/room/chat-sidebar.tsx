"use client";

import { useState } from "react";
import { MessageSquare, Crown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types/user";

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUser: User;
}

const ChatSidebar = ({
  messages,
  onSendMessage,
  currentUser,
}: ChatSidebarProps) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="w-96 border-l border-light-royal-blue/20 bg-gradient-to-b from-darkblue/40 to-bluish-gray/20 backdrop-blur-sm flex flex-col shadow-2xl">
      <div className="p-6 border-b border-light-royal-blue/20 bg-gradient-to-r from-darkblue/50 to-bluish-gray/30">
        <h2 className="text-xl font-bold text-white font-fredoka flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-xl border border-light-royal-blue/30">
            <MessageSquare className="w-5 h-5 text-light-royal-blue" />
          </div>
          Live Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
              message.userId === currentUser?.id
                ? "bg-gradient-to-r from-light-royal-blue/20 to-plum/20 border-light-royal-blue/30 ml-8 shadow-lg"
                : "bg-gradient-to-r from-white/5 to-white/2 border-white/10 mr-8 shadow-md"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-semibold text-sm flex items-center gap-2">
                {message.userName}
                <Crown className="w-3 h-3 text-light-royal-blue" />
              </span>
              <span className="text-light-bluish-gray/70 text-xs">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-light-royal-blue/20 bg-gradient-to-r from-darkblue/40 to-bluish-gray/20">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray rounded-xl px-4 py-3 focus:border-light-royal-blue focus:bg-white/10 focus:ring-2 focus:ring-light-royal-blue/20 transition-all duration-300"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-6 py-3 hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidebar;
