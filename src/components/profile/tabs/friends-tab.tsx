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
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentFriends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl px-4 py-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
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
                  } w-8 h-8 hover:cursor-pointer text-sm rounded-lg transition-all duration-200`}
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
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FriendsTab;
