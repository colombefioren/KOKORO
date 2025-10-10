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
  Gauge,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  isHost: boolean;
  previousVideoId?: string;
  onPlayPreviousVideo?: () => void;
}

const VideoPlayer = ({
  videoId,
  title,
  isHost,
  previousVideoId,
  onPlayPreviousVideo,
}: VideoPlayerProps) => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());
  };

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    const state = event.data;
    setIsPlaying(state === YT.PlayerState.PLAYING);
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
  };

  const handleRewind = () => {
    if (!player || !isHost) return;
    player.seekTo(Math.max(0, currentTime - 10), true);
  };

  const handleFastForward = () => {
    if (!player || !isHost) return;
    player.seekTo(Math.min(duration, currentTime + 10), true);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!player || !isHost) return;
    setPlaybackRate(rate);
    player.setPlaybackRate(rate);
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
      disablekb: 1,
    },
  };

  if (!isHost) {
    return (
      <div
        ref={playerContainerRef}
        className="flex-1 relative mx-6 mb-6 rounded-3xl border-2 border-light-royal-blue/30 bg-gradient-to-br from-darkblue/40 to-bluish-gray/30 overflow-hidden shadow-2xl group"
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
            <div className="absolute top-4 left-6">
              <div className="bg-darkblue/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-light-royal-blue/30 inline-block">
                <h3 className="text-white text-sm font-semibold truncate max-w-md">
                  {title}
                </h3>
              </div>
            </div>

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
                  <div className="flex items-center gap-3 text-light-bluish-gray">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={playerContainerRef}
      className="flex-1 relative mx-6 mb-6 rounded-3xl border-2 border-light-royal-blue/30 bg-gradient-to-br from-darkblue/40 to-bluish-gray/30 overflow-hidden shadow-2xl group"
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
          <div className="absolute top-4 left-6 right-6">
            <div className="bg-darkblue/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-light-royal-blue/30 inline-block">
              <h3 className="text-white text-sm font-semibold truncate max-w-md">
                {title}
              </h3>
            </div>
          </div>

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

                  {previousVideoId && onPlayPreviousVideo && (
                    <Button
                      onClick={onPlayPreviousVideo}
                      className="bg-gradient-to-r from-plum to-light-royal-blue text-white rounded-xl p-3 hover:scale-110 transition-all duration-300"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  )}

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

                  <div className="flex items-center gap-3 text-light-bluish-gray">
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
                  </div>

                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-light-bluish-gray" />
                    <select
                      value={playbackRate}
                      onChange={(e) =>
                        handlePlaybackRateChange(parseFloat(e.target.value))
                      }
                      className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20 focus:border-light-royal-blue focus:outline-none"
                    >
                      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                        <option key={r} value={r}>
                          {r}x
                        </option>
                      ))}
                    </select>
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
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
