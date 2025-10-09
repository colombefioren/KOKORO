"use client";

import { useState } from "react";
import { Play, Pause, Volume2, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleTogglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex-1 relative m-6 rounded-3xl border-2 border-light-royal-blue/30 bg-gradient-to-br from-darkblue/40 to-bluish-gray/30 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-light-royal-blue/10 to-plum/5 rounded-3xl" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-light-royal-blue/30 to-plum/30 rounded-3xl border-2 border-light-royal-blue/40 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Play className="w-8 h-8 text-light-royal-blue" />
          </div>
          <p className="text-light-bluish-gray text-sm font-semibold">
            Video playback area
          </p>
          <p className="text-light-bluish-gray/70 text-xs mt-2">
            Currently playing: Movie Title
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-darkblue/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-light-royal-blue/30 shadow-xl">
        <Button
          onClick={handleTogglePlayback}
          className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl p-3 hover:scale-110 transition-all duration-300 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        <div className="flex items-center gap-3 text-light-bluish-gray">
          <Volume2 className="w-4 h-4" />
          <div className="w-32 h-2 bg-white/20 rounded-full">
            <div className="w-3/4 h-2 bg-gradient-to-r from-light-royal-blue to-plum rounded-full shadow-lg" />
          </div>
        </div>

        <Button className="bg-white/10 text-white rounded-xl p-3 hover:bg-white/20 transition-all duration-300">
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoPlayer;
