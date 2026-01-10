"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FriendCard from "./friend-card";
import { useUserFriends } from "@/hooks/users/useUserFriends";
import { useSocketStore } from "@/store/useSocketStore";
import { FriendRecord, User } from "@/types/user";

interface FriendsTabProps {
  userId: string;
  onProfileClick?: () => void;
}

const FriendsTab = ({ userId, onProfileClick }: FriendsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const { data: allFriends = [], loading, error } = useUserFriends(userId);
  const [localFriends, setLocalFriends] = useState(allFriends);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    setLocalFriends(allFriends);
  }, [allFriends]);

  useEffect(() => {
    if (socket) {
      const handleFriendRequestAccepted = (data: {
        friend: User;
        friendship: FriendRecord;
        to: string;
        from: string;
      }) => {
        if (data.to === userId || data.from === userId) {
          setLocalFriends((prev) => {
            const newFriendId =
              data.friend?.id || (data.from === userId ? data.to : data.from);
            if (prev.some((f) => f.id === newFriendId)) return prev;
            return [...prev, data.friend];
          });
        }
      };

      const handleFriendRemoved = (data: { to: string; from: string }) => {
        if (data.to === userId || data.from === userId) {
          setLocalFriends((prev) =>
            prev.filter((f) => f.id !== data.to && f.id !== data.from)
          );
        }
      };

      socket.on("friend-request-accepted", handleFriendRequestAccepted);
      socket.on("friend-removed", handleFriendRemoved);

      return () => {
        socket.off("friend-request-accepted", handleFriendRequestAccepted);
        socket.off("friend-removed", handleFriendRemoved);
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(8);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(localFriends.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFriends = localFriends.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <div className="relative">
          <Loader className="w-8 h-8 sm:w-12 sm:h-12 text-light-royal-blue animate-spin" />
        </div>
        <p className="mt-3 sm:mt-4 text-light-bluish-gray text-xs sm:text-sm">
          Loading friends...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <div className="relative mb-3 sm:mb-4">
          <AlertCircle className="relative w-8 h-8 sm:w-12 sm:h-12 text-red-400" />
        </div>
        <h3 className="text-sm text-white mb-1.5 sm:mb-2">
          Unable to load friends
        </h3>
        <p className="text-light-bluish-gray text-xs max-w-xs sm:max-w-sm">
          {error}
        </p>
      </div>
    );
  }

  if (localFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
        <div className="relative mb-4 sm:mb-6">
          <Users className="relative w-8 h-8 sm:w-12 sm:h-12 text-light-bluish-gray" />
        </div>
        <h3 className="text-sm text-white mb-2 sm:mb-3">No friends yet</h3>
        <p className="text-light-bluish-gray text-xs sm:text-sm max-w-xs">
          Start by adding friends to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-6">
        {currentFriends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            onProfileClick={onProfileClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-3 sm:px-4 py-2"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-1 sm:gap-2">
            {currentPage > 3 && totalPages > 5 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
                >
                  1
                </button>
                <span className="text-white/40 text-xs sm:text-sm">...</span>
              </>
            )}

            {getPaginationNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg"
                    : "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span className="text-white/40 text-xs sm:text-sm">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-3 sm:px-4 py-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FriendsTab;
