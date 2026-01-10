"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import YouTube, { YouTubeProps } from "react-youtube";
import { useSocketStore } from "@/store/useSocketStore";
import { VideoState } from "@/types/youtube";

interface VideoPlayerProps {
  videoId: string;
  isHost: boolean;
  previousVideoId?: string;
  onPlayPreviousVideo?: () => void;
  roomId: string;
  userId: string;
}

const VideoPlayer = ({ videoId, isHost, roomId, userId }: VideoPlayerProps) => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());

    if (!isHost && socket) {
      socket.emit("request-video-state", { roomId });
    }
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    const newState = event.data;

    setIsPlaying(newState === YT.PlayerState.PLAYING);

    if (!isHost) return;

    if (
      newState === YT.PlayerState.PLAYING ||
      newState === YT.PlayerState.PAUSED
    ) {
      emitVideoState();
    }
  };

  useEffect(() => {
    if (!socket || !player) return;

    const handleNewVideoState = (state: VideoState) => {
      if (state.lastUpdatedBy === userId) return;

      const drift = Math.abs(
        player.getCurrentTime() - (state.currentTime || 0)
      );
      if (drift > 0.5) player.seekTo(state.currentTime || 0, true);

      setCurrentTime(state.currentTime || 0);

      const playerState = player.getPlayerState();
      const isCurrentlyPlaying = playerState === YT.PlayerState.PLAYING;

      if (state.paused && isCurrentlyPlaying) player.pauseVideo();
      else if (!state.paused && !isCurrentlyPlaying) player.playVideo();
    };

    socket.on("new-video-state", handleNewVideoState);
    return () => {
      socket.off("new-video-state", handleNewVideoState);
    };
  }, [socket, player, userId]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      setCurrentTime(player.getCurrentTime());
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    if (!socket) return;

    const handleVideoChanged = (state: VideoState) => {
      if (!player) return;

      if (state.videoId !== videoId) {
        player.cueVideoById(state.videoId);
      }

      const drift = Math.abs(
        player.getCurrentTime() - (state.currentTime || 0)
      );
      if (drift > 0.5) player.seekTo(state.currentTime || 0, true);

      const isCurrentlyPlaying =
        player.getPlayerState() === YT.PlayerState.PLAYING;
      if (state.paused && isCurrentlyPlaying) player.pauseVideo();
      else if (!state.paused && !isCurrentlyPlaying) player.playVideo();
    };

    socket.on("video-changed", handleVideoChanged);
    return () => {
      socket.off("video-changed", handleVideoChanged);
    };
  }, [socket, player, videoId]);

  const emitVideoState = () => {
    if (!player || !isHost || !socket) return;

    const playerState = player.getPlayerState();
    const isPaused = playerState === YT.PlayerState.PAUSED;

    const state: VideoState = {
      videoId,
      paused: isPaused,
      currentTime: player.getCurrentTime(),
      roomId,
      lastUpdatedBy: userId,
      lastUpdatedAt: new Date(),
    };

    socket.emit("update-video-state", state);
  };

  const togglePlay = () => {
    if (!player || !isHost) return;
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const toggleMute = () => {
    if (!player || !isHost) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
      setVolume(50);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!player || !isHost) return;
    const vol = Math.max(0, Math.min(100, newVolume));
    setVolume(vol);
    player.setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleSeek = (time: number) => {
    if (!player || !isHost) return;
    player.seekTo(time, true);
    emitVideoState();
  };

  const handleRewind = () => {
    if (!player || !isHost) return;
    const newTime = Math.max(0, currentTime - 10);
    player.seekTo(newTime, true);
    emitVideoState();
  };

  const handleFastForward = () => {
    if (!player || !isHost) return;
    const newTime = Math.min(duration, currentTime + 10);
    player.seekTo(newTime, true);
    emitVideoState();
  };


const toggleFullscreen = () => {
  if (!playerContainerRef.current) return;
  
  if (!document.fullscreenElement) {
    if (playerContainerRef.current.requestFullscreen) {
      playerContainerRef.current.requestFullscreen();
    } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
      (playerContainerRef.current as any).webkitRequestFullscreen();
    } else if ((playerContainerRef.current as any).msRequestFullscreen) {
      (playerContainerRef.current as any).msRequestFullscreen();
    }
    setIsFullscreen(true);
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  }
};

useEffect(() => {
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);

  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  };
}, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowVolume(false);
    }, 3000);
  };

  const handleTouchStart = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowVolume(false);
    }, 3000);
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 0,
      disablekb: !isHost ? 1 : 0,
    },
  };

  const renderMobileControls = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-darkblue to-transparent">
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-white/80 min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative"
            onClick={(e) => {
              if (!isHost) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}
          >
            <div
              className="h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-xs text-white/80 min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isHost && (
              <>
                <Button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  size="icon"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={handleRewind}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  size="icon"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleFastForward}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  size="icon"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                onClick={toggleVolume}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                size="icon"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>

              {showVolume && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/90 rounded-lg">
                  <div className="flex items-center h-24">
                    <div
                      className="w-2 h-20 bg-white/20 rounded-full cursor-pointer relative"
                      onClick={(e) => {
                        if (!isHost) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent =
                          1 - (e.clientY - rect.top) / rect.height;
                        handleVolumeChange(Math.round(percent * 100));
                      }}
                    >
                      <div
                        className="w-2 bg-gradient-to-t from-light-royal-blue to-plum rounded-full absolute bottom-0"
                        style={{ height: `${isMuted ? 0 : volume}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
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
  );

  const renderDesktopControls = () => (
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
      <div className="bg-darkblue/90 backdrop-blur-xl rounded-2xl px-3 py-3 border border-light-royal-blue/30 shadow-2xl">
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
                className="h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
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
              <>
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

                <Button
                  onClick={handleRewind}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                  size="icon"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleFastForward}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                  size="icon"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </>
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
                  if (!isHost) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  handleVolumeChange(Math.round(percent * 100));
                }}
              >
                <div
                  className="h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full"
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
  );

  return (
    <div
      ref={playerContainerRef}
      className="flex-1 relative mx-2 sm:mx-4 lg:mx-6 mb-2 sm:mb-4 lg:mb-6 mt-2 sm:mt-4 lg:mt-6 rounded-2xl lg:rounded-3xl border border-light-royal-blue/30 bg-gradient-to-br from-darkblue/40 to-bluish-gray/30 overflow-hidden shadow-xl lg:shadow-2xl min-w-0 group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowControls(false);
        setShowVolume(false);
      }}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-light-royal-blue/10 to-plum/5 rounded-2xl lg:rounded-3xl" />
      <div className="relative w-full h-full aspect-video min-w-0">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="w-full h-full"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => {
            if (!showControls) {
              setShowControls(true);
              setTimeout(() => setShowControls(false), 3000);
            }
          }}
        >
          {isMobile ? renderMobileControls() : renderDesktopControls()}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
