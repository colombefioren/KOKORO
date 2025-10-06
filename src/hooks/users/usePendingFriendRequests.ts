import { getPendingFriendRequests } from "@/services/friends.service";
import { FriendRequester } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

export const usePendingFriendRequests = () => {
  const [data, setData] = useState<FriendRequester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPendingFriendRequests();
      setData(res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return { data, loading, error, refetch: fetchPending };
};
