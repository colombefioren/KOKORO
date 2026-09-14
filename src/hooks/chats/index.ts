import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chat, Message, CreateChat } from "@/types/chat";
import api from "@/lib/api";

// ── Query Keys ───────────────────────────────────────────────────
export const chatKeys = {
  all: ["chats"] as const,
  list: () => [...chatKeys.all, "list"] as const,
  privateChats: () => [...chatKeys.all, "private"] as const,
  detail: (id: string) => [...chatKeys.all, "detail", id] as const,
  messages: (chatId: string) => [...chatKeys.all, "messages", chatId] as const,
};

// ── Queries ──────────────────────────────────────────────────────
export function useChats() {
  return useQuery<Chat[]>({
    queryKey: chatKeys.list(),
    queryFn: async () => {
      const res = await api.chats.getUserChats();
      if (!res.ok) throw new Error("Failed to fetch chats");
      return res.json();
    },
  });
}

export function usePrivateChats() {
  return useQuery<Chat[]>({
    queryKey: chatKeys.privateChats(),
    queryFn: async () => {
      const res = await api.chats.getPrivateChats();
      if (!res.ok) throw new Error("Failed to fetch private chats");
      return res.json();
    },
  });
}

export function useChatById(chatId: string) {
  return useQuery<Chat>({
    queryKey: chatKeys.detail(chatId),
    queryFn: async () => {
      const res = await api.chats.getChatById(chatId);
      if (!res.ok) throw new Error("Failed to fetch chat");
      return res.json();
    },
    enabled: !!chatId,
  });
}

export function useMessages(chatId: string) {
  return useQuery<Message[]>({
    queryKey: chatKeys.messages(chatId),
    queryFn: async () => {
      const res = await api.chats.getChatMessages(chatId);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!chatId,
    staleTime: 10_000,
  });
}

// ── Mutations ────────────────────────────────────────────────────
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateChat) => {
      const res = await api.chats.createChat(data);
      if (!res.ok) throw new Error("Failed to create chat");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useFindOrRestoreChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const res = await api.chats.findOrRestoreChat({ otherUserId });
      if (!res.ok) throw new Error("Failed to find or restore chat");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const res = await api.chats.softDeleteChat(chatId);
      if (!res.ok) throw new Error("Failed to delete chat");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      data,
    }: {
      chatId: string;
      data: { content?: string; imageUrl?: string };
    }) => {
      const res = await api.chats.sendMessage(chatId, data);
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.chatId),
      });
    },
  });
}
