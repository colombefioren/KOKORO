"use client";
import { Button } from "@/components/ui/button";
import { useUserRooms } from "@/hooks/rooms/useUserHostedRooms";
import { useUserFriends } from "@/hooks/users/useUserFriends";
import { FriendRecord, User } from "@/types/user";
import {
  Share2,
  Plus,
  UserPlus,
  UserMinus,
  MessageCircle,
  Check,
  Pencil,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  declineFriendRequest,
  sendFriendRequest,
} from "@/services/friends.service";
import { useFriendRecords } from "@/hooks/users/useFriendRecords";
import { useUserStore } from "@/store/useUserStore";
import { createChat } from "@/services/chats.service";
import { ApiError } from "@/types/api";
import { useSocketStore } from "@/store/useSocketStore";
import {
  FriendRequestAcceptedPayload,
  FriendRemovedPayload,
} from "@/lib/socket";
import Image from "next/image";

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
}

const StatItem = ({
  value,
  label,
  isLoading,
}: {
  value: number;
  label: string;
  isLoading: boolean;
}) => (
  <span className="flex items-center gap-1.5">
    {isLoading ? (
      <span className="h-4 w-5 animate-pulse rounded bg-white/10" />
    ) : (
      <span className="font-semibold text-white">{value}</span>
    )}
    <span className="text-light-bluish-gray">{label}</span>
  </span>
);

const ProfileHeader = ({ user, isCurrentUser }: ProfileHeaderProps) => {
  const { data: allFriends = [], loading: friendsLoading } = useUserFriends(
    user.id,
  );
  const { data: allRooms = [], loading: roomsLoading } = useUserRooms(user.id);
  const { data: friendRecords = [] } = useFriendRecords();
  const currentUser = useUserStore((state) => state.user);
  const [isPending, setIsPending] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const [isFriend, setIsFriend] = useState(false);
  const [localFriendRecords, setLocalFriendRecords] = useState<FriendRecord[]>(
    [],
  );
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setLocalFriendRecords(friendRecords);
  }, [friendRecords]);

  useEffect(() => {
    const isFriend = () => {
      if (!currentUser) return false;
      return localFriendRecords?.some(
        (f) =>
          f.status === "ACCEPTED" &&
          ((f.requester.id === currentUser.id && f.receiver.id === user.id) ||
            (f.receiver.id === currentUser.id && f.requester.id === user.id)),
      );
    };
    setIsFriend(isFriend());
  }, [currentUser, user.id, localFriendRecords]);

  const [localStats, setLocalStats] = useState({
    friends: allFriends.length || 0,
    rooms: allRooms.length || 0,
  });

  useEffect(() => {
    setLocalStats((prev) => ({
      ...prev,
      friends: allFriends.length || 0,
      rooms: allRooms.length || 0,
    }));
  }, [allFriends, allRooms]);

  const router = useRouter();

  useEffect(() => {
    if (socket) {
      const involvesProfile = (data: { to: string; from: string }) =>
        data.to === user.id || data.from === user.id;
      const isWithCurrentUser = (data: { to: string; from: string }) =>
        involvesProfile(data) &&
        (data.to === currentUser?.id || data.from === currentUser?.id);

      const handleFriendRemoved = (data: FriendRemovedPayload) => {
        if (!involvesProfile(data)) return;
        setLocalStats((prev) => ({
          ...prev,
          friends: Math.max(prev.friends - 1, 0),
        }));
        setLocalFriendRecords((prev) =>
          prev.filter((f) => f.id !== data.friendship.id),
        );
        if (isWithCurrentUser(data)) setIsFriend(false);
      };

      const handleFriendRequestAccepted = (
        data: FriendRequestAcceptedPayload,
      ) => {
        if (!involvesProfile(data)) return;
        setLocalStats((prev) => ({ ...prev, friends: prev.friends + 1 }));
        setLocalFriendRecords((prev) => [...prev, data.friendship]);
        if (isWithCurrentUser(data)) {
          setIsFriend(true);
          toast.success("Friend request accepted!");
        }
      };

      socket.on("friend-request-accepted", handleFriendRequestAccepted);
      socket.on("friend-removed", handleFriendRemoved);

      return () => {
        socket.off("friend-request-accepted", handleFriendRequestAccepted);
        socket.off("friend-removed", handleFriendRemoved);
      };
    }
  }, [socket, user.id, currentUser?.id]);

  const handleFriendAction = async () => {
    if (!currentUser) return;

    try {
      setIsPending(true);
      if (isFriend) {
        const friendship = localFriendRecords?.find(
          (f) =>
            f.status === "ACCEPTED" &&
            ((f.requester.id === currentUser.id && f.receiver.id === user.id) ||
              (f.receiver.id === currentUser.id && f.requester.id === user.id)),
        );

        if (!friendship) {
          toast.error("Friendship record not found");
          return;
        }

        const res = await declineFriendRequest(user.id);
        if (res.error) {
          toast.error(res?.error || "Something went wrong");
          return;
        }
        socket?.emit("remove-friend", {
          to: user.id,
          from: currentUser.id,
          friendship,
        });
        toast.success("Friend removed!");
      } else {
        const res = await sendFriendRequest(user.id);
        if (res.error) {
          toast.error(res?.error || "Something went wrong");
          return;
        }
        socket?.emit("send-friend-request", {
          receiverId: user.id,
          friendRequest: res,
        });
        toast.success("Friend request sent!");
      }
    } catch {
      toast.error(`Failed to ${isFriend ? "remove" : "add"} friend`);
    } finally {
      setIsPending(false);
    }
  };

  const handleMessage = async () => {
    try {
      setIsMessaging(true);
      const chat = await createChat({ type: "PRIVATE", memberIds: [user.id] });
      router.push(`/messages/${chat.id}`);
      toast.success("Chat opened!");
      socket?.emit("open-chat", { chat, to: user.id, from: currentUser?.id });
    } catch (error) {
      toast.error((error as ApiError).error.error || "Failed to open chat");
    } finally {
      setIsMessaging(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      const domain = window.location.origin;
      const profileUrl = `${domain}/profile/${user.id}`;
      await navigator.clipboard.writeText(profileUrl);

      setIsCopied(true);
      toast.success("Profile link copied to clipboard!", {
        description:
          "Share this link with friends to invite them to view this profile.",
        duration: 3000,
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      try {
        const textArea = document.createElement("textarea");
        const profileUrl = `${window.location.origin}/profile/${user.id}`;
        textArea.value = profileUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setIsCopied(true);
          toast.success("Profile link copied to clipboard!", {
            description:
              "Share this link with friends to invite them to view this profile.",
            duration: 3000,
          });

          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        } else {
          throw new Error("Fallback copy failed");
        }
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        const profileUrl = `${window.location.origin}/profile/${user.id}`;
        toast.error("Failed to copy link. Please copy the URL manually.", {
          description: profileUrl,
          duration: 5000,
        });
      }
    }
  };

  const joinedLabel = new Date(user.createdAt).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-darkblue/70">
      <div className="relative h-28 sm:h-40 bg-gradient-to-r from-light-royal-blue via-purple to-plum">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,192,168,0.18),transparent_40%)]" />
      </div>

      <div className="px-4 sm:px-6 pb-5 sm:pb-6">
        <div className="flex items-end justify-between gap-3">
          <div className="relative z-10 -mt-12 sm:-mt-16 shrink-0 rounded-full bg-gradient-to-br from-light-royal-blue to-plum p-[3px] shadow-xl shadow-black/40">
            <Image
              src={user.image || "/placeholder.jpg"}
              alt=""
              width={128}
              height={128}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-darkblue object-cover"
            />
          </div>

          <div className="flex flex-wrap justify-end items-center gap-2 pt-3">
            {isCurrentUser ? (
              <>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  aria-label="Share profile"
                  title={isCopied ? "Link copied" : "Share profile"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                <Button
                  onClick={() => router.push("/settings")}
                  className="h-9 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit profile</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
                <Button
                  onClick={() => router.push("/rooms/create")}
                  className="h-9 rounded-full bg-gradient-to-r from-light-royal-blue to-plum px-4 text-sm font-semibold text-white shadow-md shadow-plum/20 hover:brightness-110"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create room</span>
                  <span className="sm:hidden">Room</span>
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleMessage}
                  disabled={isMessaging}
                  aria-label="Message"
                  title="Message"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                >
                  {isMessaging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                </button>
                <Button
                  onClick={handleFriendAction}
                  disabled={isPending}
                  className={`h-9 rounded-full px-4 text-sm font-semibold text-white ${
                    isFriend
                      ? "border border-white/15 bg-white/5 hover:border-pink/40 hover:bg-pink/10 hover:text-pink"
                      : "bg-gradient-to-r from-light-royal-blue to-plum shadow-md shadow-plum/20 hover:brightness-110"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFriend ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isFriend ? "Unfriend" : "Add friend"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl sm:text-2xl font-bold text-white">
              {user.name}
            </h1>
            <p className="text-sm text-light-bluish-gray">
              @{user.username || user.displayUsername || "user"}
            </p>
          </div>

          {user.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-white/80 whitespace-pre-line break-words">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <StatItem
              value={localStats.friends}
              label={localStats.friends === 1 ? "Friend" : "Friends"}
              isLoading={friendsLoading}
            />
            <StatItem
              value={localStats.rooms}
              label={localStats.rooms === 1 ? "Room" : "Rooms"}
              isLoading={roomsLoading}
            />
            <span className="flex items-center gap-1.5 text-light-bluish-gray">
              <CalendarDays className="w-3.5 h-3.5" />
              Joined {joinedLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
