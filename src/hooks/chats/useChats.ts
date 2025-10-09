import { useEffect, useState } from "react";
import { getChats } from "@/services/chats.service";
import { Chat } from "@/types/chat";

export const useChats = () => {
  const [data, setData] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await getChats();
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return { data, loading, error };
};
