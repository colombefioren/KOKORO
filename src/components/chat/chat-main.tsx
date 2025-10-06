"use client";

import { useState } from "react";
import {
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/user";
import { Input } from "../ui/input";


interface ChatMainProps {
  activeFriend: Friend;
}

const ChatMain = ({ activeFriend }: ChatMainProps) => {
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      text: "Hey! Want to watch some TikTok together? 😊",
      time: "10:23 AM",
      isSent: false,
    },
    {
      id: 2,
      text: "Sure! That sounds fun! 🎉",
      time: "10:24 AM",
      isSent: true,
    },
    {
      id: 3,
      text: "I found this super cute cat video 🐱",
      time: "10:25 AM",
      isSent: false,
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-light-royal-blue/10">
        <div className="flex items-center">
          <div className="relative group">
            <img
              src={activeFriend.avatar}
              alt={activeFriend.name}
              className="relative w-14 h-14 rounded-full border-2 border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green rounded-full border-2 border-darkblue" />
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {activeFriend.name}
              </h2>
            </div>
            <p className="text-light-bluish-gray text-sm">
              {activeFriend.activity}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.isSent ? "justify-end" : "justify-start"
            } group`}
          >
            <div className="relative">
              <div
                className={`relative max-w-md rounded-3xl px-6 py-4 border backdrop-blur-sm transition-all duration-500 ${
                  msg.isSent
                    ? "bg-gradient-to-r from-light-royal-blue to-plum text-white border-white rounded-br-md shadow-lg"
                    : "bg-white/10 text-white border-white/10 rounded-bl-md shadow-lg"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div
                  className={`text-xs opacity-70 mt-2 flex items-center gap-2 ${
                    msg.isSent ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{msg.time}</span>
                </div>

               
              </div>


            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-light-royal-blue/10">
        <div className="flex h-14 gap-3">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="h-full flex items-center bg-white/5 border-white/10 text-white placeholder-light-bluish-gray resize-none backdrop-blur-sm rounded-2xl pr-12 transition-all duration-300 focus:bg-white/10 focus:border-light-royal-blue/30"
            />
          </div>
          <Button
            onClick={() => setMessage("")}
            disabled={!message.trim()}
            className="w-14 h-full rounded-2xl bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
