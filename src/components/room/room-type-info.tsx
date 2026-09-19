import { Users, Lock, Globe } from "lucide-react";

const RoomTypeInfo = () => {
  return (
    <div className="space-y-4">
      <div className="bg-darkblue rounded-2xl p-5 border border-white/8">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-green" />
          Public Rooms
        </h3>
        <p className="text-light-bluish-gray text-xs leading-relaxed">
          Anyone can join and discover your room. Perfect for meeting new people
          and growing your community.
        </p>
      </div>

      <div className="bg-darkblue rounded-2xl p-5 border border-white/8">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-plum" />
          Private Rooms
        </h3>
        <p className="text-light-bluish-gray text-xs leading-relaxed">
          Total control over who joins. It will not appear on other users&apos;
          explore feed.
        </p>
      </div>

      <div className="bg-darkblue rounded-2xl p-5 border border-white/8">
        <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-light-royal-blue" />
          Friends Only
        </h3>
        <p className="text-light-bluish-gray text-xs leading-relaxed">
          Automatically accessible to all your friends. Great for casual
          hangouts.
        </p>
      </div>
    </div>
  );
};

export default RoomTypeInfo;
