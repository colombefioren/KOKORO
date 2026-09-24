"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
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
  const lastActorRef = useRef<string | null>(null);
  const lastLocalActionAtRef = useRef(0);
  const userActionUntilRef = useRef(0);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const emitVideoState = useCallback(
    (overrides?: { paused?: boolean; currentTime?: number }) => {
      if (!player || !isHost || !socket) return;

      lastActorRef.current = userId;

      const state: VideoState = {
        videoId,
        paused:
          overrides?.paused ??
          player.getPlayerState() === YT.PlayerState.PAUSED,
        currentTime: overrides?.currentTime ?? player.getCurrentTime(),
        roomId,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date(),
      };

      socket.emit("update-video-state", state);
    },
    [player, isHost, socket, videoId, roomId, userId],
  );

  const applyRemoteState = useCallback(
    (state: VideoState, force = false) => {
      if (!player || state.lastUpdatedBy === userId) return;
      if (!force && Date.now() - lastLocalActionAtRef.current < 1000) return;

      lastActorRef.current = state.lastUpdatedBy ?? null;
      userActionUntilRef.current = 0;

      const target = state.currentTime || 0;
      if (Math.abs(player.getCurrentTime() - target) > 0.5) {
        player.seekTo(target, true);
      }
      setCurrentTime(target);

      const isCurrentlyPlaying =
        player.getPlayerState() === YT.PlayerState.PLAYING;
      if (state.paused && isCurrentlyPlaying) player.pauseVideo();
      else if (!state.paused && !isCurrentlyPlaying) player.playVideo();
    },
    [player, userId],
  );

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());

    if (!isHost && socket) {
      socket.emit("request-video-state", { roomId });
    }
  };

  useEffect(() => {
    if (!isHost || !player || !socket) return;

    const interval = setInterval(() => {
      if (lastActorRef.current !== userId) return;

      const playerState = player.getPlayerState();
      if (
        playerState === YT.PlayerState.PLAYING ||
        playerState === YT.PlayerState.PAUSED
      ) {
        emitVideoState();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isHost, player, socket, userId, emitVideoState]);

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    const newState = event.data;

    setIsPlaying(newState === YT.PlayerState.PLAYING);

    if (!isHost || !socket || !player) return;
    if (
      newState !== YT.PlayerState.PLAYING &&
      newState !== YT.PlayerState.PAUSED
    )
      return;

    if (Date.now() > userActionUntilRef.current) return;

    userActionUntilRef.current = 0;
    lastLocalActionAtRef.current = Date.now();
    emitVideoState({ paused: newState === YT.PlayerState.PAUSED });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewVideoState = (state: VideoState) => applyRemoteState(state);

    socket.on("new-video-state", handleNewVideoState);
    return () => {
      socket.off("new-video-state", handleNewVideoState);
    };
  }, [socket, applyRemoteState]);

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

      applyRemoteState(state, true);
    };

    socket.on("video-changed", handleVideoChanged);
    return () => {
      socket.off("video-changed", handleVideoChanged);
    };
  }, [socket, player, videoId, applyRemoteState]);

  const togglePlay = () => {
    if (!player || !isHost) return;

    userActionUntilRef.current = Date.now() + 3000;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const toggleMute = () => {
    if (!player) return;

    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;

    const vol = Math.max(0, Math.min(100, newVolume));
    setVolume(vol);
    player.setVolume(vol);
    setIsMuted(vol === 0);
  };

  const seekAndBroadcast = (time: number) => {
    if (!player || !isHost) return;
    lastLocalActionAtRef.current = Date.now();
    player.seekTo(time, true);
    emitVideoState({ currentTime: time });
  };

  const handleSeek = (time: number) => seekAndBroadcast(time);

  const handleRewind = () => seekAndBroadcast(Math.max(0, currentTime - 10));

  const handleFastForward = () =>
    seekAndBroadcast(Math.min(duration, currentTime + 10));

  const toggleFullscreen = () => {
    const element = playerContainerRef.current as FullscreenHTMLElement | null;
    const doc = document as FullscreenDocument;

    if (!element) return;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
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
              className="h-2 bg-light-royal-blue rounded-full"
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
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-darkblue rounded-lg">
                  <div className="flex items-center h-24">
                    <div
                      className="w-2 h-20 bg-white/20 rounded-full cursor-pointer relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent =
                          1 - (e.clientY - rect.top) / rect.height;
                        handleVolumeChange(Math.round(percent * 100));
                      }}
                    >
                      <div
                        className="w-2 bg-light-royal-blue rounded-full absolute bottom-0"
                        style={{ height: `${isMuted ? 0 : volume}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesktopControls = () => (
    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
      <div className="bg-darkblue/95 backdrop-blur-xl rounded-2xl px-3 py-3 border border-white/10">
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
                className="h-2 bg-light-royal-blue rounded-full transition-all"
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
  );

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full lg:max-w-[calc((100vh-6rem)*16/9)] mx-auto rounded-2xl lg:rounded-3xl border border-white/10 bg-darkblue overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowControls(false);
        setShowVolume(false);
      }}
      onTouchStart={handleTouchStart}
    >
      <div className="absolute inset-0 bg-light-royal-blue/5 rounded-2xl lg:rounded-3xl" />
      <div className="relative w-full aspect-video [:fullscreen_&]:h-full [:fullscreen_&]:aspect-auto">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="absolute inset-0"
          iframeClassName="w-full h-full"
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
