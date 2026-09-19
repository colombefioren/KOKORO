"use client";

import { Search, Loader, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import FriendListItem from "../friend-list-item";
import { User } from "@/types/user";

interface FriendsSidebarTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFriends: User[];
  loading?: boolean;
  error?: string | null;
  onProfileClick?: () => void;
}

const FriendsSidebarTab = ({
  searchQuery,
  setSearchQuery,
  filteredFriends,
  loading = false,
  error = null,
  onProfileClick,
}: FriendsSidebarTabProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder-light-bluish-gray focus:border-light-royal-blue/50 rounded-md"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pt-4">
        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-light-bluish-gray text-sm">{error}</p>
          </div>
        )}

        {loading && filteredFriends.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 text-light-royal-blue animate-spin" />
          </div>
        )}

        {!loading && !error && filteredFriends.length === 0 && (
          <p className="text-light-bluish-gray text-sm text-center py-8">
            {searchQuery.trim()
              ? `No friends match "${searchQuery.trim()}".`
              : "No friends yet."}
          </p>
        )}

        {!loading && !error && filteredFriends.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredFriends.map((friend) => (
              <FriendListItem
                key={friend.id}
                friend={friend}
                onProfileClick={onProfileClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsSidebarTab;
