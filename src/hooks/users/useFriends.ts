import { getFriends } from "@/services/friends.service";
import { User } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

export const useFriends = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFriends();
      setData(res);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { data, loading, error, refetch: fetchFriends };
};
