"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCardFlat from "./room-card-flat";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRooms, roomKeys } from "@/hooks/rooms";
import { useUserStore } from "@/store/useUserStore";
import { RoomRecord } from "@/types/room";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

const RoomRow = ({
  title,
  rooms,
  emptyText,
}: {
  title: string;
  rooms: RoomRecord[];
  emptyText?: string;
}) => {
  if (rooms.length === 0 && !emptyText) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-white font-semibold text-base">{title}</h2>
      {rooms.length === 0 ? (
        <p className="text-light-bluish-gray text-sm">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {rooms.map((room) => (
            <RoomCardFlat key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
};

const RoomRowSkeleton = ({ title }: { title: string }) => (
  <section className="space-y-3">
    <h2 className="text-white font-semibold text-base">{title}</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-[172px] rounded-2xl bg-white/5 animate-pulse"
        />
      ))}
    </div>
  </section>
);

const RoomsGalleryContent = () => {
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: allRooms = [], isLoading } = useRooms();
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserId = user?.id;

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return allRooms;
    const query = searchQuery.toLowerCase();
    return allRooms.filter((room) => {
      const host = room.members.find((m) => m.role === "HOST");
      return (
        room.name.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query) ||
        host?.user?.name?.toLowerCase().includes(query)
      );
    });
  }, [allRooms, searchQuery]);

  const yourRooms = useMemo(
    () =>
      filteredRooms.filter((room) =>
        room.members.some((m) => m.user.id === currentUserId),
      ),
    [filteredRooms, currentUserId],
  );

  const favoriteRooms = useMemo(
    () =>
      filteredRooms.filter((room) =>
        room.members.some((m) => m.user.id === currentUserId && m.isFavorite),
      ),
    [filteredRooms, currentUserId],
  );

  const discoverRooms = useMemo(
    () =>
      filteredRooms.filter((room) => {
        const isMember = room.members.some((m) => m.user.id === currentUserId);
        if (isMember) return false;
        return room.type === "PUBLIC" || room.type === "FRIENDS";
      }),
    [filteredRooms, currentUserId],
  );

  useEffect(() => {
    if (!socket) return;

    const handleFavoriteToggled = () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    const handlePublicRoomCreated = () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    const handleInvitedToRoom = (newRoom: { id: string; name: string }) => {
      toast.success(`You were invited to "${newRoom.name}"`);
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    const handleMemberJoinedRoom = () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    socket.on("favorite-toggled", handleFavoriteToggled);
    socket.on("public-room-created", handlePublicRoomCreated);
    socket.on("invited-to-room", handleInvitedToRoom);
    socket.on("member-joined-room", handleMemberJoinedRoom);

    return () => {
      socket.off("favorite-toggled", handleFavoriteToggled);
      socket.off("public-room-created", handlePublicRoomCreated);
      socket.off("invited-to-room", handleInvitedToRoom);
      socket.off("member-joined-room", handleMemberJoinedRoom);
    };
  }, [socket, queryClient]);

  return (
    <div className="flex-1 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Rooms
          </h1>
          <p className="text-light-bluish-gray text-sm">
            Watch together, live, no pages to flip through
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 flex-1 sm:w-64">
            <Search className="w-4 h-4 text-light-bluish-gray flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="bg-transparent text-white text-sm py-2.5 outline-none w-full placeholder:text-light-bluish-gray/60"
            />
          </div>
          <Button
            onClick={() => router.push("/rooms/create")}
            className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-4 py-2.5 font-semibold flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <RoomRowSkeleton title="Your rooms" />
          <RoomRowSkeleton title="Discover" />
        </div>
      ) : (
        <>
          <RoomRow title="Your rooms" rooms={yourRooms} />
          <RoomRow title="Favorites" rooms={favoriteRooms} />
          <RoomRow
            title="Discover"
            rooms={discoverRooms}
            emptyText={
              searchQuery
                ? "No rooms match your search."
                : "No public rooms yet. Be the first to start one."
            }
          />
        </>
      )}
    </div>
  );
};

const RoomsGallery = () => {
  return (
    <ErrorBoundary>
      <RoomsGalleryContent />
    </ErrorBoundary>
  );
};

export default RoomsGallery;
