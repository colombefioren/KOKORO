import { useEffect, useState, useMemo } from "react";
import { getRooms } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";

export const useRooms = () => {
  const [data, setData] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const hostedRooms = useMemo(
    () => data.filter((room) => room.members.some((m) => m.role === "HOST")),
    [data]
  );

  const joinedRooms = useMemo(
    () => data.filter((room) => room.members.some((m) => m.role === "MEMBER")),
    [data]
  );

  const activeRooms = useMemo(
    () => data.filter((room) => room.isActive),
    [data]
  );

  const favoriteRooms = useMemo(
    () => data.filter((room) => room.isFavorite),
    [data]
  );

  const otherRooms = useMemo(
    () =>
      data.filter(
        (room) =>
          !room.members.some((m) => m.role === "HOST" || m.role === "MEMBER")
      ),
    [data]
  );

  return {
    data,
    loading,
    error,
    hostedRooms,
    joinedRooms,
    activeRooms,
    favoriteRooms,
    otherRooms,
  };
};
