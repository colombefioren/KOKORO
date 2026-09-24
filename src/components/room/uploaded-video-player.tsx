"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/store/useSocketStore";
import { VideoState } from "@/types/youtube";

interface UploadedVideoPlayerProps {
  videoUrl: string;
  isHost: boolean;
  roomId: string;
  userId: string;
}

const UploadedVideoPlayer = ({
  videoUrl,
  isHost,
  roomId,
  userId,
}: UploadedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socket = useSocketStore((state) => state.socket);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const emitVideoState = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isHost || !socket) return;

    const state: VideoState = {
      videoId: videoUrl,
      videoSource: "UPLOAD",
      paused: video.paused,
      currentTime: video.currentTime,
      roomId,
      lastUpdatedBy: userId,
      lastUpdatedAt: new Date(),
    };
    socket.emit("update-video-state", state);
  }, [isHost, socket, videoUrl, roomId, userId]);

  useEffect(() => {
    if (!isHost && socket) {
      socket.emit("request-video-state", { roomId });
    }
  }, [isHost, socket, roomId]);

  useEffect(() => {
    if (!isHost || !socket) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) emitVideoState();
    }, 2000);
    return () => clearInterval(interval);
  }, [isHost, socket, emitVideoState]);

  useEffect(() => {
    if (!socket) return;

    const applyRemoteState = (state: VideoState) => {
      const video = videoRef.current;
      if (!video || state.lastUpdatedBy === userId) return;

      const drift = Math.abs(video.currentTime - (state.currentTime ?? 0));
      if (drift > 0.5) video.currentTime = state.currentTime ?? 0;

      if (state.paused && !video.paused) video.pause();
      else if (!state.paused && video.paused) video.play().catch(() => {});
    };

    socket.on("new-video-state", applyRemoteState);
    socket.on("video-changed", applyRemoteState);
    return () => {
      socket.off("new-video-state", applyRemoteState);
      socket.off("video-changed", applyRemoteState);
    };
  }, [socket, userId]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    setTimeout(emitVideoState, 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = Math.max(0, Math.min(100, value));
    video.volume = vol / 100;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video || !isHost) return;
    video.currentTime = time;
    emitVideoState();
  };

  const toggleFullscreen = () => {
    const element = containerRef.current;
    if (!element) return;
    if (!document.fullscreenElement) element.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full md:w-[min(100cqw,calc(100cqh*16/9))] mx-auto rounded-2xl lg:rounded-3xl border border-white/8 bg-darkblue overflow-hidden shadow-xl group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative w-full aspect-video [:fullscreen_&]:h-full [:fullscreen_&]:aspect-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <div className="bg-darkblue/90 backdrop-blur-xl rounded-2xl px-3 py-3 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2 w-full h-6 mb-3">
                <span className="text-light-bluish-gray text-xs w-[36px] text-right">
                  {formatTime(currentTime)}
                </span>
                <div
                  className="relative flex-1 h-2"
                  onClick={(e) => {
                    if (!isHost) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    handleSeek(percent * duration);
                  }}
                >
                  <div className="absolute inset-0 h-full bg-white/20 rounded-full cursor-pointer">
                    <div
                      className="h-2 bg-light-royal-blue rounded-full"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-light-bluish-gray text-xs w-[36px]">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 min-w-0">
                  {isHost && (
                    <Button
                      onClick={togglePlay}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                      size="icon"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <div className="flex items-center gap-2 h-6">
                    <Button
                      onClick={toggleMute}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                      size="icon"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <div
                      className="relative w-20 h-2 bg-white/20 rounded-full cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        handleVolumeChange(Math.round(percent * 100));
                      }}
                    >
                      <div
                        className="h-2 bg-light-royal-blue rounded-full"
                        style={{ width: `${isMuted ? 0 : volume}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                  size="icon"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedVideoPlayer;
