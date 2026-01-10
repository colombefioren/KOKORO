"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Loader, Video } from "lucide-react";
import { YouTubeSearch } from "@/components/room/youtube/youtube-search";
import VideoPlayer from "./youtube/video-player";
import { useSocketStore } from "@/store/useSocketStore";
import RoomNotFound from "./room-not-found";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, X } from "lucide-react";

const RoomPanel = () => {
  const params = useParams();
  const [chatId, setChatId] = useState<string | null>(null);
  const currentUser = useUserStore((state) => state.user);
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hostId, setHostId] = useState<string | null>(null);
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [chatHeight, setChatHeight] = useState(400); // Default height for chat
  const [membersHeight, setMembersHeight] = useState(400); // Default height for members
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [isDraggingMembers, setIsDraggingMembers] = useState(false);

  const chatDragRef = useRef<HTMLDivElement>(null);
  const membersDragRef = useRef<HTMLDivElement>(null);
  const socket = useSocketStore((state) => state.socket);

  const [currentVideo, setCurrentVideo] = useState({
    videoId: "bzPQ61oYMtQ",
  });

  const maxMobileHeight =
    typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
  const minMobileHeight = 200;

  const handleChatMouseDown = (e: React.MouseEvent) => {
    setIsDraggingChat(true);
    e.preventDefault();
    document.body.style.overflow = "hidden";
  };

  const handleChatTouchStart = (e: React.TouchEvent) => {
    setIsDraggingChat(true);
    document.body.style.overflow = "hidden";
    e.preventDefault();
  };

  const handleMembersMouseDown = (e: React.MouseEvent) => {
    setIsDraggingMembers(true);
    e.preventDefault();
    document.body.style.overflow = "hidden";
  };

  const handleMembersTouchStart = (e: React.TouchEvent) => {
    setIsDraggingMembers(true);
    document.body.style.overflow = "hidden";
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingChat) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= minMobileHeight && newHeight <= maxMobileHeight) {
          setChatHeight(newHeight);
        }
      }
      if (isDraggingMembers) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= minMobileHeight && newHeight <= maxMobileHeight) {
          setMembersHeight(newHeight);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingChat) {
        const touch = e.touches[0];
        const newHeight = window.innerHeight - touch.clientY;
        if (newHeight >= minMobileHeight && newHeight <= maxMobileHeight) {
          setChatHeight(newHeight);
        }
      }
      if (isDraggingMembers) {
        const touch = e.touches[0];
        const newHeight = window.innerHeight - touch.clientY;
        if (newHeight >= minMobileHeight && newHeight <= maxMobileHeight) {
          setMembersHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingChat(false);
      setIsDraggingMembers(false);
      document.body.style.overflow = "unset";
    };

    if (isDraggingChat || isDraggingMembers) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDraggingChat, isDraggingMembers, maxMobileHeight, minMobileHeight]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const wantedRoom = await getRoomById(params.id as string);
        setRoom(wantedRoom);
        setChatId(wantedRoom.chat.id);

        const hostMember = wantedRoom.members.find(
          (member: RoomMember) => member.role === "HOST"
        );
        setHostId(hostMember?.userId || null);

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

  useEffect(() => {
    if (socket && room && currentUser) {
      const isHost = room.members.some(
        (member) => member.userId === currentUser.id && member.role === "HOST"
      );

      socket.emit("join-room", {
        roomId: room.id,
        userId: currentUser.id,
        isHost,
      });
    }

    return () => {
      if (socket && room && currentUser) {
        socket.emit("leave-room", {
          roomId: room.id,
          userId: currentUser.id,
        });
      }
    };
  }, [socket, room, currentUser]);

  useEffect(() => {
    if (showChat || showMembers) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showChat, showMembers]);

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

        socket?.emit("change-video", {
          roomId: room?.id,
          videoId,
          previousVideoId: currentVideo.videoId,
          lastUpdatedBy: currentUser.id,
        });

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

        socket?.emit("change-video", {
          roomId: room?.id,
          videoId: previousVideoId,
          previousVideoId: currentVideo.videoId,
        });

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
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-light-royal-blue animate-spin mx-auto" />
          <div className="text-white text-lg font-medium">Loading room...</div>
          <div className="text-light-bluish-gray text-sm max-w-xs mx-auto">
            Preparing your watching experience
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return <RoomNotFound />;
  }

  const FloatingButtons = () => (
    <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {showChat ? (
        <Button
          onClick={() => setShowChat(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-2xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <X className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          onClick={() => {
            setShowChat(true);
            setShowMembers(false);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-2xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {showMembers ? (
        <Button
          onClick={() => setShowMembers(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green to-emerald-400 text-white shadow-2xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <X className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          onClick={() => {
            setShowMembers(true);
            setShowChat(false);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green to-emerald-400 text-white shadow-2xl hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <Users className="w-6 h-6" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {(showChat || showMembers) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            setShowChat(false);
            setShowMembers(false);
          }}
        />
      )}

      <div className="flex lg:flex-row flex-col lg:h-screen">
        <div className="flex-1 flex flex-col lg:h-screen overflow-hidden">
          <RoomHeader room={room} isHost={isHost} />

          {isHost && (
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 space-y-4">
              <YouTubeSearch
                onVideoSelect={handleVideoSelect}
                isHost={isHost}
                previousVideoId={previousVideoId ?? ""}
                onPlayPreviousVideo={handlePlayPreviousVideo}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 mt-4 sm:mt-6">
            <VideoPlayer
              videoId={currentVideo.videoId}
              isHost={isHost}
              previousVideoId={previousVideoId ?? ""}
              onPlayPreviousVideo={handlePlayPreviousVideo}
              roomId={room.id}
              userId={currentUser.id}
            />

            <div className="flex items-center mt-4 sm:mt-5 gap-4 lg:hidden">
              <div className="p-3 bg-gradient-to-br from-light-royal-blue/20 to-blue-400/20 rounded-2xl border border-light-royal-blue/30">
                <Video className="w-6 h-6 text-light-royal-blue" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white font-fredoka">
                  {room.name}
                </h1>
                <p className="text-light-bluish-gray text-sm">
                  {room.description}
                </p>
              </div>
            </div>

            <div className="hidden lg:block mt-4">
              <MembersList members={room.members} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-96 w-full h-full border-l border-light-royal-blue/20 bg-gradient-to-b from-darkblue/40 to-bluish-gray/20 backdrop-blur-sm flex flex-col shadow-2xl">
          <ChatSidebar
            hostId={hostId}
            chatId={chatId}
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
          />
        </div>
      </div>

      {showChat && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-darkblue shadow-2xl transition-transform duration-300"
          style={{
            top: `${Math.max(0, window.innerHeight - chatHeight)}px`,
            height: `${chatHeight}px`,
          }}
        >
          <div
            ref={chatDragRef}
            onMouseDown={handleChatMouseDown}
            onTouchStart={handleChatTouchStart}
            className="absolute top-0 left-0 right-0 h-8 cursor-row-resize flex items-center justify-center touch-none z-50"
          >
            <div className="w-12 h-1.5 bg-light-royal-blue/30 rounded-full" />
          </div>

          <div className="h-full pt-8 overflow-hidden">
            <ChatSidebar
              hostId={hostId}
              chatId={chatId}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {showMembers && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-darkblue border-t border-light-royal-blue/20 rounded-t-2xl shadow-2xl overflow-hidden transition-transform duration-300"
          style={{
            height: `${membersHeight}px`,
            maxHeight: `${maxMobileHeight}px`,
            minHeight: `${minMobileHeight}px`,
          }}
        >
          <div
            ref={membersDragRef}
            onMouseDown={handleMembersMouseDown}
            onTouchStart={handleMembersTouchStart}
            className="absolute top-0 left-0 right-0 h-8 cursor-row-resize flex items-center justify-center touch-none z-50"
          >
            <div className="w-12 h-1.5 bg-green/30 rounded-full" />
          </div>

          <div className="h-full pt-8 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Room Members</h3>
              </div>
              <MembersList members={room.members} />
            </div>
          </div>
        </div>
      )}

      <FloatingButtons />
    </div>
  );
};

export default RoomPanel;
