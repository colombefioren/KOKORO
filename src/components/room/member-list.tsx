import { RoomMember } from "@/types/room";
import { Users, Crown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MembersListProps {
  members: RoomMember[];
}

const MembersList = ({ members }: MembersListProps) => {
  const router = useRouter();
  return (
    <div className="p-4 sm:p-6 border-t border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green/15 flex items-center justify-center">
            <Users className="w-4 h-4 text-green" />
          </div>
          <h3 className="text-white font-semibold text-sm">Room Members</h3>
        </div>
        <span className="text-light-bluish-gray text-xs">{members.length}</span>
      </div>

      <div className="flex -space-x-3 mt-5">
        {members.slice(0, 5).map((member) => (
          <div
            onClick={() => router.push(`/profile/${member.userId}`)}
            key={member.userId}
            className="cursor-pointer relative group"
          >
            <div className="relative">
              <Image
                src={member.user.image || "/placeholder.jpg"}
                alt=""
                width={44}
                height={44}
                className="rounded-full aspect-square border-2 border-darkblue object-cover group-hover:border-light-royal-blue/50 transition-colors"
              />
              {member.role === "HOST" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-light-royal-blue rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-darkblue text-white text-[11px] rounded-lg px-2.5 py-1.5 whitespace-nowrap border border-white/10 z-10">
              {member.user.name}
            </div>
          </div>
        ))}
        {members.length - 5 > 0 && (
          <div className="w-11 h-11 rounded-full bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center text-light-bluish-gray text-[11px] font-medium">
            +{members.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList;
