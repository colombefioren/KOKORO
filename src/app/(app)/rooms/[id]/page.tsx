"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import RoomHeader from "@/components/room/room-header";
import VideoPlayer from "@/components/room/video-player";
import MembersList from "@/components/room/member-list";
import ChatSidebar from "@/components/room/chat-sidebar";
import { getRoomById } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";

const RoomPage = () => {
  const params = useParams();
  const { user } = useUserStore();
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const wantedRoom = await getRoomById(params.id as string);
        setRoom(wantedRoom);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [params.id]);

  const isHost = room?.members.some(
    (member) => member.userId === user?.id && member.role === "HOST"
  ) || false;

  const handleSendMessage = (content: string) => {
 console.log("Message sent:", content);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-light-blue text-lg">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <RoomHeader room={room} isHost={isHost} />
          <VideoPlayer />
          <MembersList members={room.members} />
        </div>
        <ChatSidebar
          messages={room.chat?.messages || []}
          onSendMessage={handleSendMessage}
          currentUser={user!}
        />
      </div>
    </div>
  );
};

export default RoomPage;
