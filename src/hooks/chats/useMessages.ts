import { useEffect, useState } from "react";
import { getMessages } from "@/services/chats.service";
import { Message } from "@/types/chat";

export const useMessages = (chatId: string) => {
  const [data, setData] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await getMessages(chatId);
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  return { data, loading, error };
};
