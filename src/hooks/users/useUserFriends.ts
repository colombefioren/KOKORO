import { getUserFriends } from "@/services/friends.service";
import { User } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

export const useUserFriends = (userId: string) => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserFriends = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getUserFriends(userId);
      setData(res);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch user friends");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserFriends();
  }, [fetchUserFriends]);

  return { data, loading, error, refetch: fetchUserFriends };
};
