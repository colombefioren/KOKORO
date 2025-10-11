import { Search, Loader, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import FriendListItem from "../friend-list-item";
import { User } from "@/types/user";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useFriendRecords } from "@/hooks/users/useFriendRecords";

interface FriendsSidebarTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFriends: User[];
  loading?: boolean;
  error?: string | null;
}

const FriendsSidebarTab = ({
  searchQuery,
  setSearchQuery,
  filteredFriends,
  loading = false,
  error = null,
}: FriendsSidebarTabProps) => {
  const user = useUserStore((state) => state.user);
  const { data: friendRecords } = useFriendRecords();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [localQuery, setSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-bluish-gray w-4 h-4" />
        <Input
          type="text"
          placeholder="Search friends..."
          value={localQuery}
          onChange={handleInputChange}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-light-bluish-gray focus:border-light-royal-blue/50 rounded-2xl"
        />
      </div>

      <div className="space-y-3">
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

        {!loading &&
          !error &&
          filteredFriends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              showAddButton
              friendRecords={friendRecords}
              currentUserId={user?.id || ""}
            />
          ))}
      </div>
    </>
  );
};

export default FriendsSidebarTab;
