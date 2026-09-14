"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCategories from "./room-categories";
import RoomsContainer from "./rooms-container";
import RoomSearchBar from "./room-search-bar";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRooms, roomKeys } from "@/hooks/rooms";
import { useUserStore } from "@/store/useUserStore";
import { RoomRecord } from "@/types/room";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

const RoomsGalleryContent = () => {
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: allRooms = [], isLoading: loading } = useRooms();

  const [activeCategory, setActiveCategory] = useState("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const currentUserId = user?.id;

  const hostedRooms = useMemo(
    () =>
      allRooms.filter((room) =>
        room.members.some(
          (m) => m.user.id === currentUserId && m.role === "HOST"
        )
      ),
    [allRooms, currentUserId]
  );

  const joinedRooms = useMemo(
    () =>
      allRooms.filter((room) =>
        room.members.some(
          (m) => m.user.id === currentUserId && m.role === "MEMBER"
        )
      ),
    [currentUserId, allRooms]
  );

  const favoriteRooms = useMemo(
    () =>
      allRooms.filter((room) =>
        room.members.some((m) => m.user.id === currentUserId && m.isFavorite)
      ),
    [allRooms, currentUserId]
  );

  const otherRooms = useMemo(() => {
    return allRooms.filter((room) => {
      const isHost = room.members.some(
        (m) => m.user.id === currentUserId && m.role === "HOST"
      );
      if (isHost) return false;
      return room.type === "PUBLIC" || room.type === "FRIENDS";
    });
  }, [allRooms, currentUserId]);

  const filterRooms = useCallback(
    (rooms: RoomRecord[]) => {
      if (!searchQuery.trim()) return rooms;
      const query = searchQuery.toLowerCase();
      return rooms.filter((room) => {
        const roomNameMatch = room.name.toLowerCase().includes(query);
        const roomDescriptionMatch = room.description
          ?.toLowerCase()
          .includes(query);
        const host = room.members.find((member) => member.role === "HOST");
        const hostNameMatch = host?.user?.name?.toLowerCase().includes(query);
        return roomNameMatch || roomDescriptionMatch || hostNameMatch;
      });
    },
    [searchQuery]
  );

  const categories = useMemo(
    () => ({
      explore: filterRooms(otherRooms),
      "my-rooms": filterRooms(hostedRooms),
      invited: filterRooms(joinedRooms),
      favorites: filterRooms(favoriteRooms),
    }),
    [otherRooms, hostedRooms, joinedRooms, favoriteRooms, filterRooms]
  );

  const isLoading = loading || isSearching;

  const stats = useMemo(
    () => ({
      explore: otherRooms.length,
      myRooms: hostedRooms.length,
      invited: joinedRooms.length,
      favorites: favoriteRooms.length,
    }),
    [otherRooms, hostedRooms, joinedRooms, favoriteRooms]
  );

  useEffect(() => {
    if (!socket) return;

    const handleFavoriteToggled = () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    const handlePublicRoomCreated = () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    };

    const handleInvitedToRoom = (newRoom: RoomRecord) => {
      toast.success(
        `You have been invited to the room ${newRoom.name}! Go check it out.`
      );
    };

    socket.on("favorite-toggled", handleFavoriteToggled);
    socket.on("public-room-created", handlePublicRoomCreated);
    socket.on("invited-to-room", handleInvitedToRoom);

    return () => {
      socket.off("favorite-toggled", handleFavoriteToggled);
      socket.off("public-room-created", handlePublicRoomCreated);
      socket.off("invited-to-room", handleInvitedToRoom);
    };
  }, [socket, currentUserId, queryClient]);

  return (
    <div className="flex-1 py-6">
      <div className="mb-10 mt-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Rooms Center
            </h1>
            <p className="text-white/60 text-sm">
              Your spaces to connect and have fun
            </p>
          </div>

          <div className="gallery-actions flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/rooms/create")}
              className="bg-green z-1 hover:bg-green/80 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl px-4 sm:px-5 py-3 font-semibold w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>
      </div>

      <RoomCategories
        stats={stats}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isLoading={isLoading}
      />

      <RoomSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search ${activeCategory} rooms...`}
      />

      {Object.entries(categories).map(([category, categoryRooms]) => (
        <RoomsContainer
          key={category}
          category={category}
          rooms={categoryRooms}
          isActive={activeCategory === category}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      ))}
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
