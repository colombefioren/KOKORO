"use client";

import { useState, useEffect } from "react";
import { RoomRecord } from "@/types/room";
import RoomCard from "./room-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else {
        setItemsPerPage(6);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  if (!isActive) return null;

  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = rooms.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading) {
    return (
      <div className="rooms-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemsPerPage)].map((_, index) => (
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
    <div className="space-y-8">
      <div className="rooms-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-light-royal-blue to-plum text-white"
                      : "bg-transparent text-white/60 hover:text-white"
                  } w-8 h-8 hover:cursor-pointer text-sm rounded-lg`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-2"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
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