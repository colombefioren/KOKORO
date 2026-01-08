"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface RoomSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RoomSearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search rooms by name, description, or host..." 
}: RoomSearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative mb-8 w-md">
      <div className={`relative transition-all duration-300`}>
        <div className="absolute -inset-1 bg-gradient-to-r from-light-royal-blue/20 to-plum/10 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-light-royal-blue/30 transition-all duration-300">
          <div className="flex items-center px-4 py-2">
            <Search className={`w-5 h-5 mr-3 transition-colors duration-300 ${
              isFocused ? 'text-light-royal-blue' : 'text-white/70'
            }`} />
            
            <Input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-sm md:text-md"
            />
            
            {localValue && (
              <button
                onClick={handleClear}
                className="ml-3 p-1 hover:cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSearchBar;