import { getUserHostedRooms } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";
import { useEffect, useState } from "react";

export const useUserRooms = (userId: string) => {
  const [data, setData] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const res = await getUserHostedRooms(userId);
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load user rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRooms();
  }, [userId]);

  return {
    data,
    loading,
    error,
  };
};
