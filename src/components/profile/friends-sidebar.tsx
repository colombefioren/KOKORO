"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FriendListItem from "./friend-list-item";

const FriendsSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const friends = [
    {
      id: 1,
      name: "Sarah Kawaii",
      avatar: "https://i.pravatar.cc/150?img=1",
      status: "online" as const,
      activity: "Watching TikTok together"
    },
    {
      id: 2,
      name: "Mikey Chan",
      avatar: "https://i.pravatar.cc/150?img=5",
      status: "online" as const,
      activity: "Online - Available"
    },
    {
      id: 3,
      name: "Emma Bun",
      avatar: "https://i.pravatar.cc/150?img=7",
      status: "ingame" as const,
      activity: "In a room with 2 others"
    },
    {
      id: 4,
      name: "Alex Purr",
      avatar: "https://i.pravatar.cc/150?img=9",
      status: "offline" as const,
      activity: "Last seen 2h ago"
    },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-gradient-to-b from-darkblue/90 to-bluish-gray/80 backdrop-blur-sm border-l border-light-royal-blue/20 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white font-fredoka mb-2">Friends</h2>
        <div className="w-12 h-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full" />
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
        <Input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-light-bluish-gray focus:border-light-royal-blue/50"
        />
      </div>

      <div className="space-y-3">
        {filteredFriends.map((friend) => (
          <FriendListItem key={friend.id} friend={friend} />
        ))}
        
        {filteredFriends.length === 0 && searchQuery && (
          <div className="text-center text-light-bluish-gray py-8">
            No friends found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsSidebar;