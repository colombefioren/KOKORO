"use client";

import { useState } from "react";
import ChatSidebar from "./chat-sidebar";
import ChatMain from "./chat-main";
import TogetherRoom from "./together-room";

const ChatPanel = () => {
  const [activeRoom, setActiveRoom] = useState(false);
  const [activeFriend, setActiveFriend] = useState({
    id: 1,
    name: "Sarah Kawaii",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "online",
    activity: "Watching TikTok"
  });

  return (
    <div className="flex h-screen overflow-hidden relative">

      
      <div className="flex flex-1 overflow-hidden border border-light-royal-blue/10 rounded-3xl my-4 shadow-2xl">
        <ChatSidebar 
          activeFriend={activeFriend}
          onFriendSelect={setActiveFriend}
        />
        <ChatMain 
          activeFriend={activeFriend}
        />
      </div>

      <TogetherRoom 
        isOpen={activeRoom}
        onClose={() => setActiveRoom(false)}
        friend={activeFriend}
      />
    </div>
  );
};

export default ChatPanel;