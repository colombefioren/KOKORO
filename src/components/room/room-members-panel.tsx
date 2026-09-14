"use client";

import { useState } from "react";
import { X, Crown, Shield, UserMinus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomMember, RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";
import { useSocketStore } from "@/store/useSocketStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoomMembersPanelProps {
  room: RoomRecord;
  isOpen: boolean;
  onClose: () => void;
}

const RoomMembersPanel = ({ room, isOpen, onClose }: RoomMembersPanelProps) => {
  const currentUser = useUserStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const isHost = room.members.some(
    (m) => m.userId === currentUser?.id && m.role === "HOST"
  );

  const hosts = room.members.filter((m) => m.role === "HOST");
  const members = room.members.filter((m) => m.role === "MEMBER");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handlePromote = async (member: RoomMember) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote", targetUserId: member.userId }),
      });
      if (res.ok) {
        toast.success(`${member.user.name} promoted to Host`);
        // Reload page to reflect changes
        window.location.reload();
      }
    } catch {
      toast.error("Failed to promote member");
    }
  };

  const handleRemove = async (member: RoomMember) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", targetUserId: member.userId }),
      });
      if (res.ok) {
        toast.success(`${member.user.name} removed from room`);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const renderMember = (member: RoomMember, isHostMember: boolean) => (
    <div
      key={member.userId}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <button
        onClick={() => {
          router.push(`/profile/${member.userId}`);
          handleClose();
        }}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        <div className="relative flex-shrink-0">
          <Image
            src={member.user.image || "./placeholder.jpg"}
            alt=""
            width={36}
            height={36}
            className="rounded-full border border-white/10"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green border-2 border-darkblue" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {member.user.name}
            {member.userId === currentUser?.id && (
              <span className="text-light-bluish-gray/60 ml-1">(you)</span>
            )}
          </p>
          <p className="text-light-bluish-gray text-[11px] truncate">
            @{member.user.username || "user"}
          </p>
        </div>
      </button>

      <div className="flex items-center gap-1.5">
        {isHostMember ? (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-light-royal-blue/15 text-light-royal-blue text-[10px] font-medium">
            <Crown className="w-2.5 h-2.5" />
            Host
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-light-bluish-gray text-[10px]">
            <Shield className="w-2.5 h-2.5" />
            Member
          </span>
        )}

        {isHost && !isHostMember && member.userId !== currentUser?.id && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePromote(member)}
              className="w-7 h-7 text-light-royal-blue hover:text-white hover:bg-light-royal-blue/20"
              title="Promote to Host"
            >
              <Crown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(member)}
              className="w-7 h-7 text-pink/60 hover:text-pink hover:bg-pink/20"
              title="Remove from room"
            >
              <UserMinus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-darkblue border-l border-light-royal-blue/15 z-50 flex flex-col transition-transform duration-300 ease-out",
          isClosing ? "translate-x-full" : "translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-royal-blue/15">
          <div>
            <h3 className="text-white font-semibold text-sm">Members</h3>
            <p className="text-light-bluish-gray text-[11px]">
              {room.members.length} in this room
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="w-8 h-8 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Hosts section */}
          {hosts.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-light-bluish-gray/50 font-medium px-3 py-1">
                Hosts ({hosts.length})
              </p>
              {hosts.map((m) => renderMember(m, true))}
            </div>
          )}

          {/* Members section */}
          {members.length > 0 && (
            <div className="space-y-1 mt-3">
              <p className="text-[10px] uppercase tracking-wider text-light-bluish-gray/50 font-medium px-3 py-1">
                Members ({members.length})
              </p>
              {members.map((m) => renderMember(m, false))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomMembersPanel;
