import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, FriendRecord, FriendRequester } from "@/types/user";
import api from "@/lib/api";

// ── Query Keys ───────────────────────────────────────────────────
export const friendKeys = {
  all: ["friends"] as const,
  list: () => [...friendKeys.all, "list"] as const,
  records: () => [...friendKeys.all, "records"] as const,
  pending: () => [...friendKeys.all, "pending"] as const,
  byUser: (userId: string) => [...friendKeys.all, "user", userId] as const,
};

// ── Queries ──────────────────────────────────────────────────────
export function useFriends() {
  return useQuery<User[]>({
    queryKey: friendKeys.list(),
    queryFn: async () => {
      const res = await api.friends.getFriends();
      if (!res.ok) throw new Error("Failed to fetch friends");
      return res.json();
    },
  });
}

export function usePendingFriendRequests() {
  return useQuery<FriendRequester[]>({
    queryKey: friendKeys.pending(),
    queryFn: async () => {
      const res = await api.friends.getPendingFriendRequests();
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      return res.json();
    },
  });
}

export function useFriendRecords() {
  return useQuery<FriendRecord[]>({
    queryKey: friendKeys.records(),
    queryFn: async () => {
      const res = await api.friends.getFriendshipRecords();
      if (!res.ok) throw new Error("Failed to fetch friend records");
      return res.json();
    },
  });
}

export function useUserFriends(userId: string) {
  return useQuery<User[]>({
    queryKey: friendKeys.byUser(userId),
    queryFn: async () => {
      const res = await api.friends.getFriendsByUserId(userId);
      if (!res.ok) throw new Error("Failed to fetch user friends");
      return res.json();
    },
    enabled: !!userId,
  });
}

// ── Mutations ────────────────────────────────────────────────────
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receiverId: string) => {
      const res = await api.friends.sendFriendRequest({ receiverId });
      if (!res.ok) throw new Error("Failed to send friend request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId: string) => {
      const res = await api.friends.acceptFriendRequest({ requesterId });
      if (!res.ok) throw new Error("Failed to accept friend request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: string) => {
      const res = await api.friends.deleteFriendship({ friendId });
      if (!res.ok) throw new Error("Failed to decline friend request");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}
