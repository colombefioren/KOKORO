import { RoomMember } from "@/types/room";
import { Users, Crown } from "lucide-react";

interface MembersListProps {
  members: RoomMember[];
}

const MembersList = ({ members }: MembersListProps) => {
  return (
    <div className="p-6 border-t border-light-royal-blue/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-green/20 to-emerald-400/10 rounded-xl border border-green/30">
            <Users className="w-5 h-5 text-green" />
          </div>
          <h3 className="text-white font-semibold">Room Members</h3>
        </div>
        <span className="text-light-bluish-gray text-xs">{members.length}</span>
      </div>

      <div className="flex -space-x-3 mt-4">
        {members.slice(0, 5).map((member) => (
          <div
            key={member.id}
            className="relative group group-hover:scale-110 transition-transform duration-300"
          >
            <div className="relative">
              <img
                src={member.user.image || "https://i.pravatar.cc/150?img=1"}
                alt={member.user.name}
                className="w-12 h-12 rounded-2xl border-2 border-darkblue object-cover shadow-lg group-hover:border-light-royal-blue/50 transition-all duration-300"
              />
              {member.role === "HOST" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-light-royal-blue to-plum rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block bg-darkblue/95 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-light-royal-blue/30 shadow-xl backdrop-blur-sm">
              {member.user.name} {member.role === "HOST" && "👑"}
            </div>
          </div>
        ))}
        {members.length - 5 > 0 && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-light-royal-blue/30 flex items-center justify-center text-light-royal-blue text-sm font-semibold hover:scale-105 transition-all duration-300">
            +{members.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList;
