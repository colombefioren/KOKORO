"use client";

import { useState } from "react";
import { Search, X, Play, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  searchYouTubeVideos,
  YouTubeSearchResult,
} from "@/services/youtube.service";
import Image from "next/image";

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

  const handleVideoSelect = (video: YouTubeSearchResult) => {
    onVideoSelect(video.id.videoId, video.snippet.title, previousVideoId);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  if (!isHost) return null;

  return (
    <div className="relative w-full px-2 sm:px-4 lg:px-6">
      <div className="flex gap-2 sm:gap-3 w-full">
        {previousVideoId && (
          <Button
            onClick={onPlayPreviousVideo}
            className="bg-gradient-to-r from-plum to-light-royal-blue text-white rounded-xl px-3 sm:px-4 py-2 h-10 sm:h-auto hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            <History className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        )}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-bluish-gray" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search YouTube..."
            className="pl-10 bg-white/5 border-light-royal-blue/20 text-white placeholder-light-bluish-gray h-10 rounded-xl focus:bg-white/10 focus:border-light-royal-blue transition-all duration-300 w-full"
            disabled={isSearching}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-4 sm:px-6 h-10 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-14 sm:top-12 left-0 right-0 z-50 bg-darkblue/95 backdrop-blur-sm rounded-2xl border border-light-royal-blue/30 shadow-2xl max-h-80 overflow-y-auto">
          <div className="p-3 sm:p-4 sticky top-0 bg-darkblue z-60 border-b border-light-royal-blue/20 flex justify-between items-center">
            <h3 className="text-white font-semibold text-sm sm:text-base">
              Search Results
            </h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-light-bluish-gray hover:bg-bluish-gray/20 hover:text-white p-1 sm:p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {results.map((video) => (
              <div
                key={video.id.videoId}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-light-royal-blue/30 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => handleVideoSelect(video)}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-9 sm:w-16 sm:h-12 relative">
                    <Image
                      src={video.snippet.thumbnails.default.url}
                      alt={video.snippet.title}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-light-royal-blue transition-colors">
                    {video.snippet.title}
                  </h4>
                </div>
              </div>
            ))}

            {results.length === 0 && !isSearching && (
              <div className="text-center py-6 sm:py-8 text-light-bluish-gray text-sm">
                No videos found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
