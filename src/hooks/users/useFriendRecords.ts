import { useEffect, useState } from "react";
import { getFriendRecords } from "@/services/friends.service";
import { FriendRecord } from "@/types/user";

export const useFriendRecords = () => {
  const [data, setData] = useState<FriendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await getFriendRecords();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load friend records");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return { data, loading, error };
};
