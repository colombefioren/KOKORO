"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TvMinimalPlayIcon,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCard from "@/components/room/room-card";
import { useUserRooms } from "@/hooks/rooms/useUserHostedRooms";

interface RoomsTabProps {
  userId: string;
}

const RoomsTab = ({ userId }: RoomsTabProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { data: allRooms = [], loading, error } = useUserRooms(userId);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <Loader className="w-16 h-16 text-light-royal-blue animate-spin" />
        </div>
        <p className="mt-4 text-light-bluish-gray text-sm">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-4">
          <AlertCircle className="relative w-20 h-20 text-red-400" />
        </div>
        <h3 className="text-sm text-white mb-2">Unable to load rooms</h3>
      </div>
    );
  }

  if (allRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
          <TvMinimalPlayIcon className="relative w-20 h-20 text-light-bluish-gray" />
        </div>
        <h3 className="text-sm text-white mb-3">No rooms yet</h3>
      </div>
    );
  }

  return (
    <div className="relative">
      {allRooms.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          className="absolute hover:text-white xl:left-45 top-1/2 transform -translate-y-1/2 -translate-x-16 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      <div className="grid grid-cols-1 gap-8 mx-4 lg:mx-12 xl:mx-50">
        {currentRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {allRooms.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          className="absolute hover:text-white xl:right-45 right-0 top-1/2 transform -translate-y-1/2 translate-x-16 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
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
