"use client";

import { useState, useEffect, useMemo } from "react";
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


  useEffect(() => {
    setExploreRooms(otherRooms || []);
    setMyRooms(hostedRooms || []);
    setInvitedRooms(joinedRooms || []);
    setLocalFavoriteRooms(favoriteRooms || []);
  }, [hostedRooms, joinedRooms, favoriteRooms, otherRooms]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterRooms = (rooms: RoomRecord[]) => {
    if (!searchQuery.trim()) return rooms;

    const query = searchQuery.toLowerCase();
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query) ||
        room.members.some(
          (member) =>
            member.role === "HOST" &&
            member.user?.name?.toLowerCase().includes(query)
        )
    );
  };

  const roomsMap = useMemo(
    () => ({
      explore: filterRooms(exploreRooms),
      "my-rooms": filterRooms(myRooms),
      invited: filterRooms(invitedRooms),
      favorites: filterRooms(localFavoriteRooms),
    }),
    [filterRooms, exploreRooms, myRooms, invitedRooms, localFavoriteRooms]
  );

  const stats = {
    explore: exploreRooms.length,
    myRooms: myRooms.length,
    invited: invitedRooms.length,
    favorites: localFavoriteRooms.length,
  };


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

    socket.on("favorite-toggled", handleFavoriteToggled);

    return () => {
      socket.off("favorite-toggled", handleFavoriteToggled);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handlePublicRoomCreated = (newRoom: RoomRecord) => {
      setExploreRooms((prev) => {
        if (prev.find((r) => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
    };

    socket.on("public-room-created", handlePublicRoomCreated);

    return () => {
      socket.off("public-room-created", handlePublicRoomCreated);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleInvitedToRoom = (newRoom: RoomRecord) => {
      setInvitedRooms((prev) => {
        if (prev.find((r) => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
      toast.success(
        "You have been invited to the room " +
          newRoom.name +
          " ! Go check it out."
      );
    };

    socket.on("invited-to-room", handleInvitedToRoom);

    return () => {
      socket.off("invited-to-room", handleInvitedToRoom);
    };
  }, [socket]);

  return (
    <div className="flex-1 py-6">
      <div className="mb-10 mt-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Rooms Center
            </h1>
            <p className="text-white/60 text-sm">
              Your spaces to connect and and have fun
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
        isLoading={loading}
      />

      <RoomSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={`Search rooms...`}
      />

      {Object.entries(roomsMap).map(([category, categoryRooms]) => (
        <RoomsContainer
          key={category}
          category={category}
          rooms={categoryRooms.map((room) => ({
            ...room,
            isFavorite: localFavoriteRooms.some((r) => r.id === room.id),
          }))}
          isActive={activeCategory === category}
          isLoading={loading}
        />
      ))}
    </div>
  );
};

export default RoomsGallery;
