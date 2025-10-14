import { useEffect, useState, useMemo } from "react";
import { getRooms } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";

export const useRooms = () => {
  const [data, setData] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await getRooms();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const currentUserId = user?.id;

  const hostedRooms = useMemo(
    () =>
      data.filter((room) =>
        room.members.some(
          (m) => m.user.id === currentUserId && m.role === "HOST"
        )
      ),
    [data, currentUserId]
  );

  const joinedRooms = useMemo(
    () =>
      data.filter((room) =>
        room.members.some(
          (m) => m.user.id === currentUserId && m.role === "MEMBER"
        )
      ),
    [currentUserId, data]
  );


  const favoriteRooms = useMemo(
    () =>
      data.filter((room) =>
        room.members.some((m) => m.user.id === currentUserId && m.isFavorite)
      ),
    [data, currentUserId]
  );

  const otherRooms = useMemo(() => {
    return data.filter((room) => {
      const isHost = room.members.some(
        (m) => m.user.id === currentUserId && m.role === "HOST"
      );

      if (isHost) return false;

      return room.type === "PUBLIC" || room.type === "FRIENDS";
    });
  }, [data, currentUserId]);

  return {
    data,
    loading,
    error,
    hostedRooms,
    joinedRooms,
    favoriteRooms,
    otherRooms,
  };
};
