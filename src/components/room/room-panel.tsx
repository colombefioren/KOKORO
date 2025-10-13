"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import RoomHeader from "@/components/room/room-header";
import MembersList from "@/components/room/member-list";
import ChatSidebar from "@/components/room/chat-sidebar";
import {
  getRoomById,
  updatePreviousVideo,
  getRoomVideoState,
  updateRoomCurrentVideo,
} from "@/services/rooms.service";
import { RoomMember, RoomRecord } from "@/types/room";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { YouTubeSearch } from "@/components/room/youtube/youtube-search";
import VideoPlayer from "./youtube/video-player";
import { useSocketStore } from "@/store/useSocketStore";
import RoomNotFound from "./room-not-found";

const RoomPanel = () => {
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(null);
  const currentUser = useUserStore((state) => state.user);
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hostId, setHostId] = useState<string | null>(null);
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);

  const socket = useSocketStore((state) => state.socket);

  const [currentVideo, setCurrentVideo] = useState({
    videoId: "bzPQ61oYMtQ",
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const wantedRoom = await getRoomById(params.id as string);
        setRoom(wantedRoom);
        setChatId(wantedRoom.chat.id);
        setHostId(
          wantedRoom.members.find(
            (member: RoomMember) => member.role === "HOST"
          )?.userId
        );

        const videoState = await getRoomVideoState(params.id as string);
        setPreviousVideoId(videoState.previousVideoId);

        if (videoState.currentVideoId) {
          setCurrentVideo({
            videoId: videoState.currentVideoId,
          });
        }
      } catch (error) {
        console.error(error);
        setRoom(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [params.id]);

  if (!currentUser) return null;

  const isHost =
    room?.members.some(
      (member) => member.userId === currentUser.id && member.role === "HOST"
    ) || false;

  const handleVideoSelect = async (videoId: string, title: string) => {
    if (isHost) {
      try {
        await updatePreviousVideo(
          params.id as string,
          currentVideo.videoId,
          videoId
        );

        await updateRoomCurrentVideo(params.id as string, videoId, title);

        setPreviousVideoId(currentVideo.videoId);
        setCurrentVideo({ videoId });
        toast.success("Video changed successfully!");
      } catch (error) {
        console.error("Failed to update video:", error);
        toast.error("Failed to update video");
      }
    }
  };

  const handlePlayPreviousVideo = async () => {
    if (isHost && previousVideoId) {
      try {
        await updatePreviousVideo(
          params.id as string,
          currentVideo.videoId,
          previousVideoId
        );

        await updateRoomCurrentVideo(
          params.id as string,
          previousVideoId,
          `Previous Video (${previousVideoId})`
        );

        setCurrentVideo({
          videoId: previousVideoId,
        });
        setPreviousVideoId(currentVideo.videoId);
        toast.success("Playing previous video!");
      } catch (error) {
        console.error("Failed to play previous video:", error);
        toast.error("Failed to load previous video");
      }
    }
  };

  const handleSendMessage = (content: string) => {
    const messagePayload = {
      id: crypto.randomUUID(),
      chatId,
      content,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      sender: currentUser,
    };
    socket?.emit("send-message", messagePayload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-light-royal-blue animate-spin mb-2" />
        <div className="text-light-bluish-gray">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return <RoomNotFound />;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="flex lg:flex-row flex-col lg:h-screen overflow-y-scroll">
        <div className=" flex-1 flex flex-col">
          <RoomHeader room={room} isHost={isHost} />

          {isHost && (
            <div className="mx-6 mt-6 space-y-4">
              <YouTubeSearch
                onVideoSelect={handleVideoSelect}
                isHost={isHost}
                previousVideoId={previousVideoId ?? ""}
                onPlayPreviousVideo={handlePlayPreviousVideo}
              />
            </div>
          )}

          <VideoPlayer
            videoId={currentVideo.videoId}
            isHost={isHost}
            previousVideoId={previousVideoId ?? ""}
            onPlayPreviousVideo={handlePlayPreviousVideo}
          />

          <MembersList members={room.members} />
        </div>

        <ChatSidebar
          hostId={hostId}
          chatId={chatId}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default RoomPanel;