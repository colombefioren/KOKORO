import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import FriendListItem from "../friend-list-item";
import { Friend } from "@/types/user";

interface FriendsSidebarTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFriends: Friend[];
}

const FriendsSidebarTab = ({ searchQuery, setSearchQuery, filteredFriends }: FriendsSidebarTabProps) => {
  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
        <Input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-light-bluish-gray focus:border-light-royal-blue/50 rounded-2xl"
        />
      </div>

      <div className="space-y-3">
        {filteredFriends.map((friend) => (
          <FriendListItem key={friend.id} friend={friend} showAddButton />
        ))}

        {filteredFriends.length === 0 && searchQuery && (
          <div className="text-center text-light-bluish-gray py-8">
            No friends found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </>
  );
};

export default FriendsSidebarTab;