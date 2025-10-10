"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCategories from "./room-categories";
import RoomsContainer from "./rooms-container";
import { useRouter } from "next/navigation";
import { useRooms } from "@/hooks/rooms/useRooms";
import { RoomRecord } from "@/types/room";

const RoomsGallery = () => {
  const [activeCategory, setActiveCategory] = useState("explore");
  const router = useRouter();
  const {
    hostedRooms: myRooms,
    joinedRooms: invited,
    favoriteRooms: favorites,
    otherRooms: explore,
    loading,
  } = useRooms();

  const rooms = {
    explore: explore,
    "my-rooms": myRooms,
    invited: invited,
    favorites: favorites,
  };

  const stats = {
    explore: explore?.length || 0,
    myRooms: myRooms?.length || 0,
    invited: invited?.length || 0,
    favorites: favorites?.length || 0,
  };

  return (
    <div className="flex-1 py-6">
      <div className="mb-10 mt-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Rooms Center</h1>
            <p className="text-white/60 text-sm">
              Your spaces to connect and collaborate
            </p>
          </div>

          <div className="gallery-actions flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/rooms/create")}
              className="bg-green z-1 hover:bg-green/80 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl px-5 py-3 font-semibold"
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

      {Object.entries(rooms).map(([category, categoryRooms]) => (
        <RoomsContainer
          key={category}
          category={category}
          rooms={categoryRooms as RoomRecord[]}
          isActive={activeCategory === category}
          isLoading={loading}
        />
      ))}
    </div>
  );
};

export default RoomsGallery;
