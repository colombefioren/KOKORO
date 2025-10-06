"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCard from "@/components/room/room-card";

const RoomsTab = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const allRooms = [
    {
      id: 1,
      name: "Anime Watch Party",
      type: "public" as const,
      description: "Watching the latest anime episodes together!",
      members: 8,
      maxMembers: 10,
      memberAvatars: [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=5",
        "https://i.pravatar.cc/150?img=7",
        "https://i.pravatar.cc/150?img=9",
      ],
      active: true,
      created: "2024-01-15",
      isOwner: true,
      isFavorite: true,
    },
    {
      id: 2,
      name: "Gaming Session",
      type: "friends" as const,
      description: "Playing Among Us with close friends",
      members: 5,
      maxMembers: 10,
      memberAvatars: [
        "https://i.pravatar.cc/150?img=12",
        "https://i.pravatar.cc/150?img=3",
        "https://i.pravatar.cc/150?img=15",
      ],
      active: true,
      created: "2024-01-14",
      isOwner: true,
      isFavorite: false,
    },
    {
      id: 3,
      name: "Music Listening",
      type: "public" as const,
      description: "Chill music listening session",
      members: 3,
      maxMembers: 8,
      memberAvatars: [
        "https://i.pravatar.cc/150?img=2",
        "https://i.pravatar.cc/150?img=6",
      ],
      active: false,
      created: "2024-01-13",
      isOwner: true,
      isFavorite: true,
    },
    {
      id: 4,
      name: "Study Group",
      type: "private" as const,
      description: "Focus study session with lo-fi beats",
      members: 4,
      maxMembers: 6,
      memberAvatars: [
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=8",
        "https://i.pravatar.cc/150?img=10",
      ],
      active: true,
      created: "2024-01-12",
      isOwner: true,
      isFavorite: false,
    },
  ];

  const itemsPerPage = 1;
  const totalPages = Math.ceil(allRooms.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentRooms = allRooms.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <div className="relative">
      {allRooms.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          className="absolute hover:text-white left-45 top-1/2 transform -translate-y-1/2 -translate-x-16 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      <div className="grid grid-cols-1 gap-8 mx-50">
        {currentRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {allRooms.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          className="absolute hover:text-white right-45 top-1/2 transform -translate-y-1/2 translate-x-16 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? "bg-gradient-to-r from-light-royal-blue to-plum scale-125"
                  : "bg-light-bluish-gray/30 hover:bg-light-bluish-gray/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsTab;
