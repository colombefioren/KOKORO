import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";
import api from "@/lib/api";

// ── Query Keys ───────────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  search: (query: string) => [...userKeys.all, "search", query] as const,
};

// ── Queries ──────────────────────────────────────────────────────
export function useUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const res = await api.user.getUser();
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const res = await api.user.getUserById(id);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useSearchUsers(query: string) {
  return useQuery<User[]>({
    queryKey: userKeys.search(query),
    queryFn: async () => {
      const res = await api.users.searchUsers({ q: query });
      if (!res.ok) throw new Error("Failed to search users");
      return res.json();
    },
    enabled: !!query && query.length >= 2,
    staleTime: 5000,
  });
}
