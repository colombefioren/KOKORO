import { Button } from "@/components/ui/button";
import { RoomRecord } from "@/types/room";
import { User } from "@/types/user";
import { Share2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  user: User;
  friends: User[];
  rooms: RoomRecord[];
}

const ProfileHeader = ({ user, friends, rooms }: ProfileHeaderProps) => {
  const stats = {
    friends: friends.length,
    rooms: rooms.length,
    days: Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  };
const router = useRouter();
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-12">
      <div className="relative group">
        <img
          src={user.image || "https://i.pravatar.cc/300?img=32"}
          alt="Profile"
          className="relative border border-white w-28 h-28 lg:w-36 lg:h-36 rounded-full"
        />
      </div>

      <div className="flex-1 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-2xl font-bold text-white font-fredoka">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-light-bluish-gray text-sm">
            @{user.username || user.displayUsername || "user"}
          </p>
        </div>

        <p className="text-white/80 text-sm max-w-2xl leading-relaxed">
          {user.bio || ""}
        </p>

        <div className="flex flex-wrap gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.friends}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Friends
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.rooms}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Rooms
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{stats.days}</div>
            <div className="text-light-bluish-gray text-sm font-medium">
              Days
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 pt-2">
          <Button
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          <Button onClick={() => {router.push("/rooms/create")}} className="bg-gradient-to-r hover:text-white from-light-royal-blue to-plum text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
