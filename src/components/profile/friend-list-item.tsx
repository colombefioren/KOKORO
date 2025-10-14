import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface FriendListItemProps {
  friend: User;
}

export const getStatusGlow = (status: boolean) => {
  switch (status) {
    case true:
      return "shadow-green/20";
    default:
      return "shadow-light-royal-blue/20";
  }
};

const FriendListItem = ({
  friend,
}: FriendListItemProps) => {
  const router = useRouter();

 


  return (
    <div
      onClick={() => router.push(`/profile/${friend.id}`)}
      className="group relative p-4 bg-gradient-to-r from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-light-royal-blue/40 transition-all duration-300 cursor-pointer hover:bg-white/10 hover:shadow-lg hover:shadow-light-royal-blue/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
    
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate mb-1">
              {friend.name}
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FriendListItem;
