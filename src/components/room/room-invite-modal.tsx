"use client";

import { useState, useEffect } from "react";
import { X, Search, Link2, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocketStore } from "@/store/useSocketStore";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string;
  username?: string | null;
  image?: string | null;
}

interface RoomInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

const RoomInviteModal = ({
  isOpen,
  onClose,
  roomId,
  roomName,
}: RoomInviteModalProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  useEffect(() => {
    if (!isOpen) return;
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok) {
          const data = await res.json();
          setFriends(data);
        }
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };
    fetchFriends();
  }, [isOpen]);

  const filteredFriends = friends.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name?.toLowerCase().includes(q) ||
      f.username?.toLowerCase().includes(q)
    );
  });

  const handleInvite = async (friendId: string) => {
    if (invitedIds.has(friendId)) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeId: friendId }),
      });
      if (res.ok) {
        setInvitedIds((prev) => new Set(prev).add(friendId));
        const friend = friends.find((f) => f.id === friendId);
        socket?.emit("invited-to-room", {
          userId: friendId,
          room: { id: roomId, name: roomName },
        });
        toast.success(`Invited ${friend?.name || "friend"}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/rooms/${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setIsLinkCopied(true);
      toast.success("Room link copied!");
      setTimeout(() => setIsLinkCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-darkblue border border-light-royal-blue/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-royal-blue/15">
          <div>
            <h3 className="text-white font-semibold text-sm">Invite to Room</h3>
            <p className="text-light-bluish-gray text-[11px]">{roomName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 text-light-bluish-gray hover:text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Copy link */}
        <div className="p-4 border-b border-light-royal-blue/15">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
          >
            <Link2 className="w-4 h-4 text-light-royal-blue flex-shrink-0" />
            <span className="text-white text-sm flex-1 text-left truncate">
              {`${typeof window !== "undefined" ? window.location.origin : ""}/rooms/${roomId}`}
            </span>
            {isLinkCopied ? (
              <Check className="w-4 h-4 text-green flex-shrink-0" />
            ) : (
              <span className="text-light-bluish-gray text-[11px] flex-shrink-0">
                Copy
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-bluish-gray" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder-light-bluish-gray rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Friends list */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-1">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-light-bluish-gray text-xs">
                {searchQuery ? "No friends found" : "No friends to invite"}
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const isInvited = invitedIds.has(friend.id);
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Image
                    src={friend.image || "./placeholder.jpg"}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{friend.name}</p>
                    <p className="text-light-bluish-gray text-[11px] truncate">
                      @{friend.username || "user"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInvite(friend.id)}
                    disabled={isInvited || isLoading}
                    className={cn(
                      "rounded-lg text-[11px] px-3 h-7",
                      isInvited
                        ? "bg-green/15 text-green cursor-default"
                        : "bg-light-royal-blue/15 text-light-royal-blue hover:bg-light-royal-blue/25"
                    )}
                  >
                    {isInvited ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    {isInvited ? "Sent" : "Invite"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomInviteModal;
