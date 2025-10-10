import { useEffect, useState } from "react";
import { getChatById } from "@/services/chats.service";
import { Chat } from "@/types/chat";

export const useChatById = ({ chatId }: { chatId: string }) => {
  const [data, setData] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChat = async (chatId: string) => {
      try {
        setLoading(true);
        const res = await getChatById(chatId);
        setData(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChat(chatId);
  }, [chatId]);

  return { data, loading, error };
};
