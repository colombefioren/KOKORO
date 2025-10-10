"use client";

import { RoomRecord } from "@/types/room";
import RoomCard from "./room-card";

interface RoomsContainerProps {
  category: string;
  rooms: RoomRecord[];
  isActive: boolean;
  isLoading?: boolean;
}

const RoomsContainer = ({
  category,
  rooms,
  isActive,
  isLoading = false,
}: RoomsContainerProps) => {
  if (!isActive) return null;

  if (isLoading) {
    return (
      <div className="rooms-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded w-full"></div>
              <div className="h-3 bg-white/5 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
              <div className="h-6 bg-white/5 rounded w-16"></div>
              <div className="h-8 bg-white/5 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="empty-state mt-30 text-center py-16 text-light-bluish-gray">
        <h3 className="text-2xl font-bold text-white mb-2">
          No {getCategoryLabel(category)} yet
        </h3>
        <p>{getEmptyStateMessage(category)}</p>
      </div>
    );
  }

  return (
    <div className="rooms-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

function getCategoryLabel(category: string): string {
  const labels = {
    "my-rooms": "My Rooms",
    invited: "Invitations",
    explore: "Rooms",
    favorites: "Favorites",
  };
  return labels[category as keyof typeof labels] || category;
}

function getEmptyStateMessage(category: string): string {
  const messages = {
    "my-rooms": "Create your first room to start hanging out with friends!",
    invited: "You haven't been invited to any rooms yet.",
    explore: "Seems like the world is quiet right now!",
    favorites: "Mark rooms as favorites to see them here.",
  };
  return messages[category as keyof typeof messages] || "No rooms found.";
}

export default RoomsContainer;
