"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCategories from "./room-categories";
import RoomsContainer from "./rooms-container";
import { useRouter } from "next/navigation";
interface Room {
  id: number;
  name: string;
  type: "public" | "private" | "friends";
  description: string;
  members: number;
  maxMembers: number;
  memberAvatars: string[];
  active: boolean;
  created: string;
  isOwner: boolean;
  isInvited?: boolean;
  isFavorite?: boolean;
}

const RoomsGallery = () => {
  const [activeCategory, setActiveCategory] = useState("my-rooms");
 const router = useRouter();
  const sampleRooms = {
    "my-rooms": [
      {
        id: 1,
        name: "Kawaii Chill Zone",
        type: "public",
        description: "A cozy place to relax and watch cute videos together",
        members: 5,
        maxMembers: 10,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=1",
          "https://i.pravatar.cc/150?img=5",
          "https://i.pravatar.cc/150?img=7",
          "https://i.pravatar.cc/150?img=9",
          "https://i.pravatar.cc/150?img=12",
        ],
        active: true,
        created: "2023-10-15",
        isOwner: true,
      },
      {
        id: 2,
        name: "Anime Watch Party",
        type: "friends",
        description: "Weekly anime viewing sessions with friends",
        members: 3,
        maxMembers: 8,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=3",
          "https://i.pravatar.cc/150?img=15",
          "https://i.pravatar.cc/150?img=20",
        ],
        active: true,
        created: "2023-10-10",
        isOwner: true,
      },
      {
        id: 3,
        name: "Gaming Squad",
        type: "private",
        description: "Private room for our gaming team",
        members: 4,
        maxMembers: 6,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=8",
          "https://i.pravatar.cc/150?img=11",
          "https://i.pravatar.cc/150?img=14",
          "https://i.pravatar.cc/150?img=17",
        ],
        active: false,
        created: "2023-10-05",
        isOwner: true,
      },
      {
        id: 4,
        name: "Gaming Squad",
        type: "private",
        description: "Private room for our gaming team",
        members: 4,
        maxMembers: 6,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=8",
          "https://i.pravatar.cc/150?img=11",
          "https://i.pravatar.cc/150?img=14",
          "https://i.pravatar.cc/150?img=17",
        ],
        active: false,
        created: "2023-10-05",
        isOwner: true,
      },
      {
        id: 5,
        name: "Anime Watch Party",
        type: "friends",
        description: "Weekly anime viewing sessions with friends",
        members: 3,
        maxMembers: 8,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=3",
          "https://i.pravatar.cc/150?img=15",
          "https://i.pravatar.cc/150?img=20",
        ],
        active: true,
        created: "2023-10-10",
        isOwner: true,
      },
    ],
    invited: [
      {
        id: 4,
        name: "Movie Night Club",
        type: "friends",
        description: "Weekly movie screenings and discussions",
        members: 8,
        maxMembers: 15,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=2",
          "https://i.pravatar.cc/150?img=6",
          "https://i.pravatar.cc/150?img=10",
          "https://i.pravatar.cc/150?img=13",
        ],
        active: true,
        created: "2023-10-12",
        isOwner: false,
        isInvited: true,
      },
      {
        id: 5,
        name: "Study Group",
        type: "private",
        description: "Collaborative study sessions and resource sharing",
        members: 6,
        maxMembers: 10,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=4",
          "https://i.pravatar.cc/150?img=16",
          "https://i.pravatar.cc/150?img=18",
          "https://i.pravatar.cc/150?img=19",
        ],
        active: true,
        created: "2023-10-08",
        isOwner: false,
        isInvited: true,
      },
    ],
    active: [
      {
        id: 6,
        name: "K-Pop Dance Party",
        type: "public",
        description: "Dance along to your favorite K-Pop hits!",
        members: 12,
        maxMembers: 20,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=21",
          "https://i.pravatar.cc/150?img=22",
          "https://i.pravatar.cc/150?img=23",
          "https://i.pravatar.cc/150?img=24",
        ],
        active: true,
        created: "2023-10-18",
        isOwner: false,
      },
      {
        id: 1,
        name: "Kawaii Chill Zone",
        type: "public",
        description: "A cozy place to relax and watch cute videos together",
        members: 5,
        maxMembers: 10,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=1",
          "https://i.pravatar.cc/150?img=5",
          "https://i.pravatar.cc/150?img=7",
          "https://i.pravatar.cc/150?img=9",
          "https://i.pravatar.cc/150?img=12",
        ],
        active: true,
        created: "2023-10-15",
        isOwner: true,
      },
    ],
    favorites: [
      {
        id: 1,
        name: "Kawaii Chill Zone",
        type: "public",
        description: "A cozy place to relax and watch cute videos together",
        members: 5,
        maxMembers: 10,
        memberAvatars: [
          "https://i.pravatar.cc/150?img=1",
          "https://i.pravatar.cc/150?img=5",
          "https://i.pravatar.cc/150?img=7",
          "https://i.pravatar.cc/150?img=9",
          "https://i.pravatar.cc/150?img=12",
        ],
        active: true,
        created: "2023-10-15",
        isOwner: true,
        isFavorite: true,
      },
    ],
  };

  //   const sampleRooms = {
  //     "my-rooms": [],
  //     invited: [],
  //     active: [],
  //     favorites: [],
  //   };

  return (
    <div className="flex-1 py-6">
      <div className="mb-10 mt-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Rooms Center</h1>
            <p className="text-white/60 text-sm">
              Your spaces to connect and collaborate
            </p>
          </div>

          <div className="gallery-actions flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/rooms/create")}
              className="bg-green z-1 hover:bg-green/80 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl px-5 py-3 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>
      </div>

      <RoomCategories
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {Object.entries(sampleRooms).map(([category, rooms]) => (
        <RoomsContainer
          key={category}
          category={category}
          rooms={rooms as Room[]}
          isActive={activeCategory === category}
        />
      ))}

     
    </div>
  );
};

export default RoomsGallery;
