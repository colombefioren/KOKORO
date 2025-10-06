"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FriendCard from "./friend-card";
import { useFriends } from "@/hooks/users/useFriends";

const FriendsTab = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { data: allFriends } = useFriends();

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
