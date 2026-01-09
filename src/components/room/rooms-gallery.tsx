"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCategories from "./room-categories";
import RoomsContainer from "./rooms-container";
import RoomSearchBar from "./room-search-bar";
import { useRouter } from "next/navigation";
import { useRooms } from "@/hooks/rooms/useRooms";
import { RoomRecord } from "@/types/room";
import { useSocketStore } from "@/store/useSocketStore";
import { toast } from "sonner";

const RoomsGallery = () => {
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);

  const { hostedRooms, joinedRooms, favoriteRooms, otherRooms, loading } =
    useRooms();

  const [exploreRooms, setExploreRooms] = useState<RoomRecord[]>([]);
  const [myRooms, setMyRooms] = useState<RoomRecord[]>([]);
  const [invitedRooms, setInvitedRooms] = useState<RoomRecord[]>([]);
  const [localFavoriteRooms, setLocalFavoriteRooms] = useState<RoomRecord[]>(
    []
  );
  const [activeCategory, setActiveCategory] = useState("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setExploreRooms(otherRooms || []);
    setMyRooms(hostedRooms || []);
    setInvitedRooms(joinedRooms || []);
    setLocalFavoriteRooms(favoriteRooms || []);
  }, [hostedRooms, joinedRooms, favoriteRooms, otherRooms]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

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

  const filteredRoomsMap = useMemo(() => {
    const categories = {
      explore: exploreRooms,
      "my-rooms": myRooms,
      invited: invitedRooms,
      favorites: localFavoriteRooms,
    };

    const filtered = Object.entries(categories).reduce((acc, [key, rooms]) => {
      acc[key] = filterRooms(rooms);
      return acc;
    }, {} as Record<string, RoomRecord[]>);

    return filtered;
  }, [exploreRooms, myRooms, invitedRooms, localFavoriteRooms, filterRooms]);

  const isLoading = loading || isSearching;

  const stats = useMemo(
    () => ({
      explore: exploreRooms.length,
      myRooms: myRooms.length,
      invited: invitedRooms.length,
      favorites: localFavoriteRooms.length,
    }),
    [exploreRooms, myRooms, invitedRooms, localFavoriteRooms]
  );

  useEffect(() => {
    if (!socket) return;

    const handleFavoriteToggled = (data: {
      room: RoomRecord;
      isFavorite: boolean;
      userId: string;
    }) => {
      const updateRooms = (
        setter: React.Dispatch<React.SetStateAction<RoomRecord[]>>
      ) =>
        setter((prevRooms) =>
          prevRooms.map((r) =>
            r.id === data.room.id
              ? {
                  ...r,
                  members: r.members.map((m) =>
                    m.userId === data.userId
                      ? { ...m, isFavorite: data.isFavorite }
                      : m
                  ),
                }
              : r
          )
        );

      updateRooms(setMyRooms);
      updateRooms(setInvitedRooms);
      updateRooms(setExploreRooms);

      setLocalFavoriteRooms((prev) => {
        const exists = prev.find((r) => r.id === data.room.id);
        if (data.isFavorite && !exists) return [...prev, data.room];
        if (!data.isFavorite && exists)
          return prev.filter((r) => r.id !== data.room.id);
        return prev;
      });
    };

    const handlePublicRoomCreated = (newRoom: RoomRecord) => {
      setExploreRooms((prev) => {
        if (prev.find((r) => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
    };

    const handleInvitedToRoom = (newRoom: RoomRecord) => {
      setInvitedRooms((prev) => {
        if (prev.find((r) => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
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
  }, [socket, toast]);

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

      {Object.entries(filteredRoomsMap).map(([category, categoryRooms]) => (
        <RoomsContainer
          key={category}
          category={category}
          rooms={categoryRooms.map((room) => ({
            ...room,
            isFavorite: localFavoriteRooms.some((r) => r.id === room.id),
          }))}
          isActive={activeCategory === category}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
};

export default RoomsGallery;
