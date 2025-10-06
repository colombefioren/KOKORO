import { Friend } from "@/types/user";

interface FriendListItemProps {
  friend: Friend;
}

const FriendListItem = ({ friend }: FriendListItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green";
      case "ingame":
        return "bg-light-royal-blue";
      case "dnd":
        return "bg-plum";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-bluish-gray";
    }
  };

  return (
    <div className="group relative p-4 bg-white/5 rounded-xl border border-white/10 hover:border-light-royal-blue/30 transition-all duration-300 cursor-pointer hover:bg-white/10">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={friend.avatar}
            alt={friend.name}
            className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-light-royal-blue/50 transition-all duration-300"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-darkblue ${getStatusColor(
              friend.status
            )}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {friend.name}
          </h3>
          <p className="text-light-bluish-gray text-xs truncate">
            {friend.activity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FriendListItem;
