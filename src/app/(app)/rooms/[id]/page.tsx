"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import RoomHeader from "@/components/room/room-header";
import VideoPlayer from "@/components/room/video-player";
import MembersList from "@/components/room/member-list";
import ChatSidebar from "@/components/room/chat-sidebar";

interface Room {
  id: string;
  name: string;
  description: string;
  hostId: string;
  currentVideo: string;
  members: Member[];
  messages: Message[];
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

const RoomPage = () => {
  const params = useParams();
  const { user } = useUserStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const mockRoom: Room = {
          id: params.id as string,
          name: "Late Night Movie Club",
          description: "Watching classic films together",
          hostId: "host-user-id",
          currentVideo: "https://example.com/video.mp4",
          members: [
            {
              id: "host-user-id",
              name: "Alex Streamer",
              avatar: "https://i.pravatar.cc/150?img=1",
              isHost: true,
            },
            {
              id: "user-2",
              name: "Sarah Kawaii",
              avatar: "https://i.pravatar.cc/150?img=2",
              isHost: false,
            },
            {
              id: "user-3",
              name: "Mikey Chan",
              avatar: "https://i.pravatar.cc/150?img=3",
              isHost: false,
            },
          ],
          messages: [
            {
              id: "1",
              userId: "host-user-id",
              userName: "Alex Streamer",
              content: "Welcome everyone! Ready to start the movie?",
              timestamp: new Date(Date.now() - 3600000),
            },
            {
              id: "2",
              userId: "user-2",
              userName: "Sarah Kawaii",
              content: "So excited for this! 🍿",
              timestamp: new Date(Date.now() - 3500000),
            },
          ],
        };
        setRoom(mockRoom);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [params.id]);

  const isHost = room?.hostId === user?.id;

  const handleSendMessage = (content: string) => {
    if (!room || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: (user.name || user.username) ?? "",
      content,
      timestamp: new Date(),
    };

    setRoom({
      ...room,
      messages: [...room.messages, message],
    });
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
          messages={room.messages}
          onSendMessage={handleSendMessage}
          currentUser={user!}
        />
      </div>
    </div>
  );
};

export default RoomPage;
