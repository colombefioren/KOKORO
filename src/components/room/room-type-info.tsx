import { Users, Lock, Globe } from "lucide-react";

const RoomTypeInfo = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green/20 to-emerald-400/10 rounded-2xl p-6 border border-green/20">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-green" />
          Public Rooms
        </h3>
        <p className="text-light-bluish-gray text-xs">
          Anyone can join and discover your room. Perfect for meeting new people
          and growing your community.
        </p>
      </div>

      <div className="bg-gradient-to-br from-plum/20 to-pink/10 rounded-2xl p-6 border border-plum/20">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-plum" />
          Private Rooms
        </h3>
        <p className="text-light-bluish-gray text-xs">
          Invite-only spaces for close friends or specific groups. Total control
          over who joins.
        </p>
      </div>

      <div className="bg-gradient-to-br from-light-royal-blue/20 to-blue-400/10 rounded-2xl p-6 border border-light-royal-blue/20">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-light-royal-blue" />
          Friends Only
        </h3>
        <p className="text-light-bluish-gray text-xs">
          Automatically accessible to all your friends. Great for casual
          hangouts.
        </p>
      </div>
    </div>
  );
};

export default RoomTypeInfo;
