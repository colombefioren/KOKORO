"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FriendCard from "./friend-card";
import { useFriends } from "@/hooks/users/useFriends";

const FriendsTab = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { data: allFriends = [], loading, error } = useFriends();

  const itemsPerPage = 4;
  const totalPages = Math.ceil(allFriends.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentFriends = allFriends.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        <p className="mt-4 text-light-bluish-gray text-sm">
          Loading friends...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-4">
          <AlertCircle className="relative w-20 h-20 text-red-400" />
        </div>
        <h3 className="text-sm text-white mb-2">
          Unable to load friends
        </h3>
      </div>
    );
  }

  if (allFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-6">
          <Users className="relative w-20 h-20 text-light-bluish-gray" />
        </div>
        <h3 className="text-sm text-white mb-3">No friends yet</h3>
       
      </div>
    );
  }

  return (
    <div className="relative">
      {allFriends.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          className="absolute hover:text-white left-20 top-1/2 transform -translate-y-1/2 -translate-x-12 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-30">
        {currentFriends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
      </div>

      {allFriends.length > itemsPerPage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          className="absolute hover:text-white right-20 top-1/2 transform -translate-y-1/2 translate-x-12 w-12 h-12 rounded-full bg-gradient-to-r from-light-royal-blue to-plum text-white shadow-lg hover:scale-110 transition-all duration-300 z-10"
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

export default FriendsTab;
