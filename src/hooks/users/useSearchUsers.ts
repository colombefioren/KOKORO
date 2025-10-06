import { searchUsers } from "@/services/user.service";
import { User } from "@/types/user";
import { useCallback, useEffect, useState } from "react";

export const useSearchUsers = (query?: string) => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!query) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await searchUsers(query);
      setData(res);
    } catch (err) {
      console.log(err);
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
};
