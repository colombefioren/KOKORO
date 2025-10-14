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

const VideoPlayer = ({
  videoId,
  isHost,
  roomId,
  userId,
}: VideoPlayerProps) => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const socket = useSocketStore((state) => state.socket);

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

  if (newState === YT.PlayerState.PLAYING || newState === YT.PlayerState.PAUSED) {
    emitVideoState();
  }
};


  useEffect(() => {
    if (!socket || !player) return;

  const handleNewVideoState = (state: VideoState) => {
  if (state.lastUpdatedBy === userId) return;

  const drift = Math.abs(player.getCurrentTime() - (state.currentTime || 0));
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const toggleMute = () => {
    if (!player || !isHost) return;
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
    if (!isFullscreen) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateProgress = () => {
    if (player && isPlaying) {
      setCurrentTime(player.getCurrentTime());
    }
  };

  useEffect(() => {
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying, updateProgress]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
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

  const renderControls = () => (
    <div className="absolute bottom-6 left-6 right-6">
      <div className="bg-darkblue/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-light-royal-blue/30 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-light-bluish-gray text-xs font-medium min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek(percent * duration);
            }}
          >
            <div
              className="h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full shadow-lg transition-all duration-200"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <span className="text-light-bluish-gray text-xs font-medium min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isHost && (
              <>
                <Button
                  onClick={togglePlay}
                  className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl p-3 hover:scale-110 transition-all duration-300 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>


                <Button
                  onClick={handleRewind}
                  className="bg-white/10 text-white rounded-xl p-3 hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleFastForward}
                  className="bg-white/10 text-white rounded-xl p-3 hover:bg-white/20 hover:scale-110 transition-all duration-300"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </>
            )}

            <div className="flex items-center gap-3 text-light-bluish-gray">
              <>
                <Button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <div
                  className="w-20 h-2 bg-white/20 rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    handleVolumeChange(Math.round(percent * 100));
                  }}
                >
                  <div
                    className="h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full shadow-lg transition-all duration-200"
                    style={{ width: `${isMuted ? 0 : volume}%` }}
                  />
                </div>
              </>
            </div>
          </div>

          <Button
            onClick={toggleFullscreen}
            className="bg-white/10 text-white rounded-xl p-3 hover:bg-white/20 hover:scale-110 transition-all duration-300"
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
      className="flex-1 relative mx-6 mb-6 mt-6 rounded-3xl border-2 border-light-royal-blue/30 bg-gradient-to-br from-darkblue/40 to-bluish-gray/30 overflow-hidden shadow-2xl group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-light-royal-blue/10 to-plum/5 rounded-3xl" />
      <div className="relative w-full h-full aspect-video">
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
        >
          {renderControls()}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
