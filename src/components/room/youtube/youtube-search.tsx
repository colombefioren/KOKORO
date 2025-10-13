"use client";

import { useState } from "react";
import { Search, X, Play, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  searchYouTubeVideos,
  YouTubeSearchResult,
} from "@/services/youtube.service";

interface YouTubeSearchProps {
  onVideoSelect: (
    videoId: string,
    title: string,
    previousVideoId?: string
  ) => void;
  isHost: boolean;
  previousVideoId?: string;
  onPlayPreviousVideo?: () => void;
}

export const YouTubeSearch = ({
  onVideoSelect,
  isHost,
  previousVideoId,
  onPlayPreviousVideo,
}: YouTubeSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !isHost) return;

    setIsSearching(true);
    try {
      const searchResults = await searchYouTubeVideos(query);
      setResults(searchResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVideoSelect = (
    video: YouTubeSearchResult,
    currentVideoId?: string
  ) => {
    onVideoSelect(video.id.videoId, video.snippet.title, currentVideoId);
    console.log("tHE VIDEO ID ", video.id.videoId)
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  if (!isHost) return null;

  return (
    <div className="relative">
      <div className="flex gap-2">
        {previousVideoId && (
          <Button
            onClick={onPlayPreviousVideo}
            className="bg-gradient-to-r from-plum to-light-royal-blue text-white rounded-xl px-4 hover:scale-105 transition-all duration-300"
          >
            <History className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-bluish-gray" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search YouTube videos..."
            className="pl-10 bg-white/5 border-light-royal-blue/20 text-white text-sm placeholder-light-bluish-gray rounded-xl focus:bg-white/10 focus:border-light-royal-blue transition-all duration-300"
            disabled={isSearching}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-6 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 bg-darkblue/95 backdrop-blur-sm rounded-2xl border border-light-royal-blue/30 shadow-2xl max-h-80 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-darkblue z-60 border-b border-light-royal-blue/20 flex justify-between items-center">
            <h3 className="text-white font-semibold">Search Results</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-light-bluish-gray hover:bg-bluish-gray/20 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            {results.map((video) => (
              <div
                key={video.id.videoId}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-light-royal-blue/30 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => handleVideoSelect(video)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    className="w-16 h-12 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-light-royal-blue transition-colors">
                    {video.snippet.title}
                  </h4>
                  <p className="text-light-bluish-gray text-xs mt-1 line-clamp-1">
                    {video.snippet.description}
                  </p>
                </div>
              </div>
            ))}

            {results.length === 0 && !isSearching && (
              <div className="text-center py-8 text-light-bluish-gray text-sm">
                No videos found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
