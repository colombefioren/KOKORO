import { useEffect, useState } from "react";
import { getPrivateChats } from "@/services/chats.service";
import { Chat } from "@/types/chat";

export const usePrivateChats = () => {
  const [data, setData] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivateChats = async () => {
      try {
        setLoading(true);
        const res = await getPrivateChats();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load private chats");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateChats();
  }, []);

  return { data, loading, error };
};
