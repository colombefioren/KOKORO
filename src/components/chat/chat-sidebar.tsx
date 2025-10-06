"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Friend } from "@/types/user";

interface ChatSidebarProps {
  activeFriend: Friend;
  onFriendSelect: (friend: Friend) => void;
}

const ChatSidebar = ({ activeFriend, onFriendSelect }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const friends: Friend[] = [
    {
      id: 1,
      name: "Sarah Kawaii",
      avatar: "https://i.pravatar.cc/150?img=1",
      status: "online",
      activity: "Watching TikTok",
    },
    {
      id: 2,
      name: "Mikey Chan",
      avatar: "https://i.pravatar.cc/150?img=5",
      status: "online",
      activity: "Online",
    },
    {
      id: 3,
      name: "Emma Bun",
      avatar: "https://i.pravatar.cc/150?img=7",
      status: "ingame",
      activity: "In a room",
    },
  ];

  return (
    <div className="w-80 flex flex-col border-r border-light-royal-blue/10">
      <div className="p-6 border-b border-light-royal-blue/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h2 className="text-3xl font-bold text-white">
              Messages
            </h2>
          </div>
          <button className="group cursor-pointer relative p-2 rounded-xl bg-gradient-to-r from-light-royal-blue/10 to-plum/10 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300">
            <UserPlus className="w-5 h-5 text-light-bluish-gray group-hover:text-white transition-colors" />
            <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue/20 to-plum/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute z-10 left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder-light-bluish-gray focus:bg-white/10 focus:border-light-royal-blue/30 backdrop-blur-sm transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {friends.map((friend, index) => (
          <div
            key={friend.id}
            onClick={() => onFriendSelect(friend)}
            className={`group relative p-4 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${
              activeFriend.id === friend.id
                ? "bg-gradient-to-r from-light-royal-blue/30 to-green/20 border-light-royal-blue/30 shadow-lg"
                : "bg-white/5 border-white/10 hover:border-light-royal-blue/20 hover:bg-white/10"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm" />
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="relative w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300"
                />
                <div
                  className={`absolute bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-darkblue ${
                    friend.status === "online"
                      ? "bg-green"
                      : friend.status === "ingame"
                      ? "bg-light-royal-blue"
                      : "bg-bluish-gray"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {friend.name}
                  </h3>
                </div>
                <p className="text-light-bluish-gray text-xs truncate">
                  {friend.activity}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
