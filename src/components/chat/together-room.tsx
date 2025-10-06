"use client";

import { X, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Friend } from "@/types/user";



interface TogetherRoomProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend;
}

const TogetherRoom = ({ isOpen, onClose, friend }: TogetherRoomProps) => {
  if (!isOpen) return null;

  const roomMessages = [
    {
      id: 1,
      text: "Ready to watch some cute cats? 😻",
      time: "10:26 AM",
      isSent: false,
    },
    {
      id: 2,
      text: "I'm so excited! Play it! 🎬",
      time: "10:26 AM",
      isSent: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-darkblue/95 backdrop-blur-sm flex flex-col">
      {/* Room Header */}
      <div className="p-6 border-b border-light-royal-blue/20 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-fredoka">
            Together with {friend.name}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-plum hover:rotate-90 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Room Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Media Section */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-darkblue/80 to-bluish-gray/60 relative overflow-hidden">
          {/* Floating decorations */}
          <div className="absolute top-20 left-15 w-8 h-8 bg-pink/30 rounded-full animate-float" />
          <div className="absolute top-70 left-80 w-10 h-10 bg-light-royal-blue/20 rounded-full animate-float-reverse" />

          <div className="text-center max-w-md p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-light-royal-blue to-plum rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Watch Together
            </h3>
            <p className="text-light-bluish-gray mb-8">
              Choose a platform to enjoy with your friend in real-time!
            </p>

            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-pink to-plum text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300">
                <span className="font-bold mr-2">TikTok</span>
              </Button>
              <Button className="bg-gradient-to-r from-light-royal-blue to-green text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300">
                <span className="font-bold mr-2">YouTube</span>
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-plum text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all duration-300">
                <span className="font-bold mr-2">Facebook</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Room Chat */}
        <div className="w-96 border-l border-light-royal-blue/20 bg-white/5 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b border-light-royal-blue/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green rounded-full animate-pulse" />
              <div>
                <h3 className="text-white font-semibold">Room Chat</h3>
                <p className="text-light-bluish-gray text-sm">
                  Chat while you watch
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {roomMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.isSent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 backdrop-blur-sm border ${
                    msg.isSent
                      ? "bg-gradient-to-r from-light-royal-blue to-plum text-white border-transparent"
                      : "bg-white/10 text-white border-white/20"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div
                    className={`text-xs opacity-70 mt-1 ${
                      msg.isSent ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-light-royal-blue/20">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-light-bluish-gray resize-none min-h-12 max-h-20 text-sm backdrop-blur-sm"
              />
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white hover:opacity-90 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TogetherRoom;
