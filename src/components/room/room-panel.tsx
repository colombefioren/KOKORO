"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import RoomHeader from "@/components/room/room-header";
import VoiceBubbles from "@/components/room/voice-bubbles";
import MembersList from "@/components/room/member-list";
import ChatSidebar from "@/components/room/chat-sidebar";
import CollapsibleChat from "@/components/room/collapsible-chat";
import RoomMembersPanel from "@/components/room/room-members-panel";
import RoomInviteModal from "@/components/room/room-invite-modal";
import {
  useRoom,
  useRoomVideoState,
  useUpdateRoomCurrentVideo,
  useUpdatePreviousVideo,
  roomKeys,
} from "@/hooks/rooms";
import { useQueryClient } from "@tanstack/react-query";
import { RoomMember } from "@/types/room";
import { toast } from "sonner";
import { Loader, Upload, Video } from "lucide-react";
import { YouTubeSearch } from "@/components/room/youtube/youtube-search";
import VideoPlayer from "./youtube/video-player";
import UploadedVideoPlayer from "./uploaded-video-player";
import { uploadRoomVideoAction } from "@/app/actions/upload-room-video.action";
import { useSocketStore } from "@/store/useSocketStore";
import RoomNotFound from "./room-not-found";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, X } from "lucide-react";

const RoomPanel = () => {
  const params = useParams();
  const roomId = params.id as string;
  const currentUser = useUserStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const queryClient = useQueryClient();

  const { data: room, isLoading } = useRoom(roomId);
  const { data: videoState } = useRoomVideoState(roomId);
  const updateCurrentVideo = useUpdateRoomCurrentVideo();
  const updatePreviousVideo = useUpdatePreviousVideo();

  const [showChat, setShowChat] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isClosingChat, setIsClosingChat] = useState(false);
  const [isClosingMembers, setIsClosingMembers] = useState(false);
  const [chatHeight, setChatHeight] = useState(400);
  const [membersHeight, setMembersHeight] = useState(400);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [isDraggingMembers, setIsDraggingMembers] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string>("bzPQ61oYMtQ");
  const [previousVideoId, setPreviousVideoId] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<"YOUTUBE" | "UPLOAD">(
    "YOUTUBE",
  );
  const [previousVideoSource, setPreviousVideoSource] = useState<
    "YOUTUBE" | "UPLOAD"
  >("YOUTUBE");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const chatDragRef = useRef<HTMLDivElement>(null);
  const membersDragRef = useRef<HTMLDivElement>(null);
  const chatAnimationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const membersAnimationRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Sync video state from server
  useEffect(() => {
    if (videoState) {
      if (videoState.currentVideoId)
        setCurrentVideoId(videoState.currentVideoId);
      if (videoState.previousVideoId)
        setPreviousVideoId(videoState.previousVideoId);
      if (videoState.videoSource) setVideoSource(videoState.videoSource);
    }
  }, [videoState]);

  const maxMobileHeight =
    typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
  const minMobileHeight = 200;

  // Drag handlers
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

  const openChat = () => {
    setShowChat(true);
    setShowMembers(false);
    setIsClosingChat(false);
  };

  const openMembers = () => {
    setShowMembers(true);
    setShowChat(false);
    setIsClosingMembers(false);
  };

  const closeChat = () => {
    setIsClosingChat(true);
    if (chatAnimationRef.current) clearTimeout(chatAnimationRef.current);
    chatAnimationRef.current = setTimeout(() => {
      setShowChat(false);
      setIsClosingChat(false);
    }, 300);
  };

  const closeMembers = () => {
    setIsClosingMembers(true);
    if (membersAnimationRef.current) clearTimeout(membersAnimationRef.current);
    membersAnimationRef.current = setTimeout(() => {
      setShowMembers(false);
      setIsClosingMembers(false);
    }, 300);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingChat) {
        const newHeight = window.innerHeight - e.clientY;
        setChatHeight(
          Math.max(minMobileHeight, Math.min(maxMobileHeight, newHeight)),
        );
      }
      if (isDraggingMembers) {
        const newHeight = window.innerHeight - e.clientY;
        setMembersHeight(
          Math.max(minMobileHeight, Math.min(maxMobileHeight, newHeight)),
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingChat) {
        const touch = e.touches[0];
        const newHeight = window.innerHeight - touch.clientY;
        setChatHeight(
          Math.max(minMobileHeight, Math.min(maxMobileHeight, newHeight)),
        );
      }
      if (isDraggingMembers) {
        const touch = e.touches[0];
        const newHeight = window.innerHeight - touch.clientY;
        setMembersHeight(
          Math.max(minMobileHeight, Math.min(maxMobileHeight, newHeight)),
        );
      }
    };

    const handleMouseUp = () => {
      setIsDraggingChat(false);
      setIsDraggingMembers(false);
      document.body.style.overflow = "unset";
    };

    if (isDraggingChat || isDraggingMembers) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
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
        document.body.style.overflow = "unset";
      };
    }
  }, [isDraggingChat, isDraggingMembers, maxMobileHeight]);

  // Socket room join
  useEffect(() => {
    if (socket && room && currentUser) {
      const isHost = room.members.some(
        (member: RoomMember) =>
          member.userId === currentUser.id && member.role === "HOST",
      );
      socket.emit("join-room", {
        roomId: room.id,
        userId: currentUser.id,
        isHost,
      });
    }

    return () => {
      if (socket && room && currentUser) {
        socket.emit("leave-room", { roomId: room.id, userId: currentUser.id });
      }
    };
  }, [socket, room, currentUser]);

  useEffect(() => {
    if (!socket || !room) return;

    const invalidateRoom = () =>
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(room.id) });

    const handleMemberJoined = (data: {
      roomId: string;
      user: { name: string };
    }) => {
      if (data.roomId !== room.id) return;
      toast.success(`${data.user.name} joined the room`);
      invalidateRoom();
    };

    const handleHostTransferred = (data: {
      roomId: string;
      newHostId: string;
    }) => {
      if (data.roomId !== room.id) return;
      invalidateRoom();
    };

    const handleModeChanged = (data: { roomId: string; mode: string }) => {
      if (data.roomId !== room.id) return;
      toast.info(
        data.mode === "FREE_FOR_ALL"
          ? "Anyone can control playback now"
          : "Only the host controls playback now",
      );
      invalidateRoom();
    };

    const handleVideoChanged = (state: {
      roomId: string;
      videoId: string;
      videoSource?: "YOUTUBE" | "UPLOAD";
      previousVideoId?: string;
    }) => {
      if (state.roomId !== room.id) return;
      setCurrentVideoId(state.videoId);
      setVideoSource(state.videoSource === "UPLOAD" ? "UPLOAD" : "YOUTUBE");
      if (state.previousVideoId) setPreviousVideoId(state.previousVideoId);
    };

    socket.on("member-joined-room", handleMemberJoined);
    socket.on("host-transferred", handleHostTransferred);
    socket.on("room-mode-changed", handleModeChanged);
    socket.on("video-changed", handleVideoChanged);

    return () => {
      socket.off("member-joined-room", handleMemberJoined);
      socket.off("host-transferred", handleHostTransferred);
      socket.off("room-mode-changed", handleModeChanged);
      socket.off("video-changed", handleVideoChanged);
    };
  }, [socket, room, queryClient]);

  // Body scroll lock for overlays
  useEffect(() => {
    if (showChat || showMembers || isClosingChat || isClosingMembers) {
      document.body.classList.add("no-scroll");
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    } else {
      document.body.classList.remove("no-scroll");
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
    }

    return () => {
      document.body.classList.remove("no-scroll");
      document.body.style.overflow = "unset";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
      if (chatAnimationRef.current) clearTimeout(chatAnimationRef.current);
      if (membersAnimationRef.current)
        clearTimeout(membersAnimationRef.current);
    };
  }, [showChat, showMembers, isClosingChat, isClosingMembers]);

  if (!currentUser) return null;

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

  const chatId = room.chat?.id ?? null;
  const hostMember = room.members.find((m: RoomMember) => m.role === "HOST");
  const hostId = hostMember?.userId ?? null;

  const isHost = room.members.some(
    (member: RoomMember) =>
      member.userId === currentUser.id && member.role === "HOST",
  );
  const canControl = isHost || room.mode === "FREE_FOR_ALL";

  const handleVideoSelect = async (videoId: string, title: string) => {
    if (!canControl) return;
    try {
      await updatePreviousVideo.mutateAsync({
        roomId,
        previousVideoId: currentVideoId,
        currentVideoId: videoId,
      });
      await updateCurrentVideo.mutateAsync({
        roomId,
        currentVideoId: videoId,
        title,
        videoSource: "YOUTUBE",
      });
      setPreviousVideoId(currentVideoId);
      setPreviousVideoSource(videoSource);
      setCurrentVideoId(videoId);
      setVideoSource("YOUTUBE");
      socket?.emit("change-video", {
        roomId: room.id,
        videoId,
        videoSource: "YOUTUBE",
        previousVideoId: currentVideoId,
        lastUpdatedBy: currentUser.id,
      });
      toast.success("Video changed successfully!");
    } catch (error) {
      console.error("Failed to update video:", error);
      toast.error("Failed to update video");
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!canControl) return;
    setIsUploadingVideo(true);
    try {
      const result = await uploadRoomVideoAction(file, roomId);
      if (result.error || !result.url) {
        toast.error(result.error || "Failed to upload video");
        return;
      }

      await updatePreviousVideo.mutateAsync({
        roomId,
        previousVideoId: currentVideoId,
        currentVideoId: result.url,
      });
      await updateCurrentVideo.mutateAsync({
        roomId,
        currentVideoId: result.url,
        title: file.name,
        videoSource: "UPLOAD",
      });
      setPreviousVideoId(currentVideoId);
      setPreviousVideoSource(videoSource);
      setCurrentVideoId(result.url);
      setVideoSource("UPLOAD");
      socket?.emit("change-video", {
        roomId: room.id,
        videoId: result.url,
        videoSource: "UPLOAD",
        previousVideoId: currentVideoId,
        lastUpdatedBy: currentUser.id,
      });
      toast.success("Video uploaded and playing!");
    } catch (error) {
      console.error("Failed to upload video:", error);
      toast.error("Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handlePlayPreviousVideo = async () => {
    if (!canControl || !previousVideoId) return;
    try {
      const nextSource = previousVideoSource;
      await updatePreviousVideo.mutateAsync({
        roomId,
        previousVideoId: currentVideoId,
        currentVideoId: previousVideoId,
      });
      await updateCurrentVideo.mutateAsync({
        roomId,
        currentVideoId: previousVideoId,
        title: `Previous Video (${previousVideoId})`,
        videoSource: nextSource,
      });
      setPreviousVideoSource(videoSource);
      setCurrentVideoId(previousVideoId);
      setVideoSource(nextSource);
      setPreviousVideoId(currentVideoId);
      socket?.emit("change-video", {
        roomId: room.id,
        videoId: previousVideoId,
        videoSource: nextSource,
        previousVideoId: currentVideoId,
      });
      toast.success("Playing previous video!");
    } catch (error) {
      console.error("Failed to play previous video:", error);
      toast.error("Failed to load previous video");
    }
  };

  const handleSendMessage = (content: string) => {
    if (!chatId) return;

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

  const FloatingButtons = () => (
    <div className="lg:hidden fixed bottom-[calc(4rem+1.5rem+env(safe-area-inset-bottom))] right-6 z-[60] flex flex-row-reverse gap-3">
      {showChat && !isClosingChat ? (
        <Button
          onClick={closeChat}
          className="w-14 h-14 rounded-full bg-light-royal-blue text-white shadow-lg hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <X className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          onClick={openChat}
          className="w-14 h-14 rounded-full bg-light-royal-blue text-white shadow-lg hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
      {showMembers && !isClosingMembers ? (
        <Button
          onClick={closeMembers}
          className="w-14 h-14 rounded-full bg-green text-white shadow-lg hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <X className="w-6 h-6" />
        </Button>
      ) : (
        <Button
          onClick={openMembers}
          className="w-14 h-14 rounded-full bg-green text-white shadow-lg hover:scale-110 transition-all duration-300"
          size="icon"
        >
          <Users className="w-6 h-6" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex lg:flex-row flex-col lg:h-screen">
        <div className="flex-1 flex flex-col lg:h-screen overflow-hidden">
          <RoomHeader
            room={room}
            isHost={isHost}
            onOpenMembers={() => setShowMembersPanel(true)}
            onOpenInvite={() => setShowInviteModal(true)}
          />

          <VoiceBubbles roomId={room.id} />

          {canControl && (
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <YouTubeSearch
                    onVideoSelect={handleVideoSelect}
                    isHost={canControl}
                    previousVideoId={previousVideoId ?? ""}
                    onPlayPreviousVideo={handlePlayPreviousVideo}
                  />
                </div>
                <label className="flex-shrink-0 flex items-center justify-center gap-2 text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isUploadingVideo ? "Uploading..." : "Upload video"}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    disabled={isUploadingVideo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) handleVideoUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 mt-4 sm:mt-6">
            {videoSource === "UPLOAD" ? (
              <UploadedVideoPlayer
                videoUrl={currentVideoId}
                isHost={canControl}
                roomId={room.id}
                userId={currentUser.id}
              />
            ) : (
              <VideoPlayer
                videoId={currentVideoId}
                isHost={canControl}
                previousVideoId={previousVideoId ?? ""}
                onPlayPreviousVideo={handlePlayPreviousVideo}
                roomId={room.id}
                userId={currentUser.id}
              />
            )}

            <div className="flex items-center mt-4 sm:mt-5 gap-4 lg:hidden">
              <div className="p-3 bg-light-royal-blue/20 rounded-2xl border border-light-royal-blue/30">
                <Video className="w-6 h-6 text-light-royal-blue" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{room.name}</h1>
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

        <CollapsibleChat
          chatId={chatId}
          hostId={hostId}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
        />
      </div>

      {/* Mobile Chat Overlay */}
      {(showChat || isClosingChat) && (
        <>
          <div
            className="lg:hidden fixed inset-0"
            style={{ opacity: isClosingChat ? 0 : 1 }}
            onClick={closeChat}
          />
          <div
            className="lg:hidden fixed inset-0 z-50 bg-darkblue shadow-2xl transition-all duration-300 ease-out"
            style={{
              top: `${Math.max(0, window.innerHeight - chatHeight)}px`,
              height: `${chatHeight}px`,
              transform: isClosingChat ? "translateY(100%)" : "translateY(0)",
              opacity: isClosingChat ? 0 : 1,
            }}
          >
            <div
              ref={chatDragRef}
              onMouseDown={handleChatMouseDown}
              onTouchStart={handleChatTouchStart}
              className="absolute draggable-handle no-select top-0 left-0 right-0 h-10 cursor-row-resize flex items-center justify-center touch-none z-50"
            >
              <div className="w-12 h-1.5 bg-light-royal-blue/30 rounded-full" />
            </div>
            <div className="h-full pt-10 pb-25 overflow-hidden">
              <ChatSidebar
                hostId={hostId}
                chatId={chatId}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                isMobile={true}
              />
            </div>
          </div>
        </>
      )}

      {/* Mobile Members Overlay */}
      {(showMembers || isClosingMembers) && (
        <>
          <div
            className="lg:hidden fixed inset-0"
            style={{ opacity: isClosingMembers ? 0 : 1 }}
            onClick={closeMembers}
          />
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-darkblue border-t border-light-royal-blue/20 shadow-2xl overflow-hidden transition-all duration-300 ease-out"
            style={{
              height: `${membersHeight}px`,
              maxHeight: `${maxMobileHeight}px`,
              minHeight: `${minMobileHeight}px`,
              transform: isClosingMembers
                ? "translateY(100%)"
                : "translateY(0)",
              opacity: isClosingMembers ? 0 : 1,
            }}
          >
            <div
              ref={membersDragRef}
              onMouseDown={handleMembersMouseDown}
              onTouchStart={handleMembersTouchStart}
              className="absolute draggable-handle no-select top-0 left-0 right-0 h-10 cursor-row-resize flex items-center justify-center touch-none z-50"
            >
              <div className="w-12 h-1.5 bg-green/30 rounded-full" />
            </div>
            <div className="h-full pt-10 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Room Members</h3>
                  <button
                    type="button"
                    onClick={closeMembers}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-light-bluish-gray hover:text-white"
                    aria-label="Close members"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <MembersList members={room.members} />
              </div>
            </div>
          </div>
        </>
      )}

      <FloatingButtons />

      {/* Desktop Members Panel */}
      <div className="hidden lg:block">
        {showMembersPanel && room && (
          <RoomMembersPanel
            room={room}
            isOpen={showMembersPanel}
            onClose={() => setShowMembersPanel(false)}
          />
        )}
      </div>

      {/* Invite Modal */}
      <RoomInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomId={room.id}
        roomName={room.name}
      />
    </div>
  );
};

export default RoomPanel;
