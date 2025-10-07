"use client";

import { Button } from "@/components/ui/button";
import { Home, Mail, Star, Globe } from "lucide-react";

interface RoomCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const RoomCategories = ({
  activeCategory,
  onCategoryChange,
}: RoomCategoriesProps) => {
  const categories = [
    { id: "explore", label: "Explore", icon: Globe, count: 3 },
    { id: "my-rooms", label: "My Rooms", icon: Home, count: 3 },
    { id: "invited", label: "Invitations", icon: Mail, count: 2 },
    { id: "favorites", label: "Favorites", icon: Star, count: 1 },
  ];

  const activeIndex = categories.findIndex((cat) => cat.id === activeCategory);

  return (
    <div className="relative mb-13">
      <div className="relative bg-darkblue rounded-2xl p-2 border border-light-royal-blue/20 backdrop-blur-sm">
        <div
          className="absolute top-2 bottom-2 bg-gradient-to-r from-light-royal-blue/90 to-plum/80 rounded-xl shadow-lg transition-all duration-500 ease-out"
          style={{
            width: `calc(${100 / categories.length}% - 8px)`,
            left: `calc(${activeIndex * (100 / categories.length)}% + 4px)`,
          }}
        />

        <div className="relative flex">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              variant="ghost"
              className={`relative hover:bg-transparent flex-1 rounded-xl py-4 px-2 transition-all duration-300 font-medium group ${
                activeCategory === category.id
                  ? "text-white hover:text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2 w-full justify-center">
                <category.icon
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeCategory === category.id
                      ? "scale-110 drop-shadow-sm"
                      : "group-hover:scale-105"
                  }`}
                />

                <span className="text-sm font-semibold whitespace-nowrap">
                  {category.label}
                </span>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold min-w-[24px] transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white/80"
                  }`}
                >
                  {category.count}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomCategories;
