import RoomCard from "./room-card";

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

interface RoomsContainerProps {
  category: string;
  rooms: Room[];
  isActive: boolean;
}

const RoomsContainer = ({ category, rooms, isActive }: RoomsContainerProps) => {
  if (!isActive) return null;

  if (rooms.length === 0) {
    return (
      <div className="empty-state  mt-30 text-center py-16 text-light-bluish-gray">
        <h3 className="text-2xl font-bold text-white mb-2">
          No {category === "explore" ? "Rooms" : category.replace("-", " ")} yet
        </h3>
        <p>{getEmptyStateMessage(category)}</p>
      </div>
    );
  }

  return (
    <div className="rooms-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

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
