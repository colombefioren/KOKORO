"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  User,
  Clapperboard,
  MessageCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { useRooms } from "@/hooks/rooms";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "user" | "room";
  title: string;
  subtitle: string;
  path: string;
}

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const currentUser = useUserStore((state) => state.user);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search rooms
  const { data: allRooms = [] } = useRooms();

  // Fuzzy search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search rooms
    allRooms.forEach((room) => {
      const nameMatch = room.name.toLowerCase().includes(q);
      const descMatch = room.description?.toLowerCase().includes(q);
      if (nameMatch || descMatch) {
        searchResults.push({
          id: room.id,
          type: "room",
          title: room.name,
          subtitle: room.description || `${room.type} room`,
          path: `/rooms/${room.id}`,
        });
      }
    });

    setResults(searchResults.slice(0, 10));
    setSelectedIndex(0);
  }, [query, allRooms]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      router.push(result.path);
      setIsOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-lg mx-4 bg-darkblue border border-light-royal-blue/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-light-royal-blue/15">
          <Search className="w-5 h-5 text-light-bluish-gray flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rooms, commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white text-sm placeholder-light-bluish-gray outline-none"
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-light-bluish-gray">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden text-light-bluish-gray hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-light-bluish-gray text-xs">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-light-bluish-gray/50 font-medium px-2 py-1">
                Quick actions
              </p>
              <button
                onClick={() => {
                  router.push("/rooms/create");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-green/15 flex items-center justify-center">
                  <Clapperboard className="w-4 h-4 text-green" />
                </div>
                <span className="text-white text-sm">Create Room</span>
                <ArrowRight className="w-3 h-3 text-light-bluish-gray ml-auto" />
              </button>
              <button
                onClick={() => {
                  router.push("/messages");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-light-royal-blue/15 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-light-royal-blue" />
                </div>
                <span className="text-white text-sm">Open Messages</span>
                <ArrowRight className="w-3 h-3 text-light-bluish-gray ml-auto" />
              </button>
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                index === selectedIndex ? "bg-white/5" : "hover:bg-white/3"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  result.type === "room"
                    ? "bg-light-royal-blue/15"
                    : "bg-white/10"
                )}
              >
                {result.type === "room" ? (
                  <Clapperboard className="w-4 h-4 text-light-royal-blue" />
                ) : (
                  <User className="w-4 h-4 text-light-bluish-gray" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{result.title}</p>
                <p className="text-light-bluish-gray text-[11px] truncate">
                  {result.subtitle}
                </p>
              </div>
              <span className="text-[10px] text-light-bluish-gray/50 uppercase flex-shrink-0">
                {result.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
