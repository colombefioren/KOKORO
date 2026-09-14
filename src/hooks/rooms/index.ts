import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomRecord, RoomUpdateInput } from "@/types/room";
import api from "@/lib/api";

// ── Query Keys ───────────────────────────────────────────────────
export const roomKeys = {
  all: ["rooms"] as const,
  list: () => [...roomKeys.all, "list"] as const,
  detail: (id: string) => [...roomKeys.all, "detail", id] as const,
  hosted: (userId: string) => [...roomKeys.all, "hosted", userId] as const,
  videoState: (roomId: string) =>
    [...roomKeys.all, "videoState", roomId] as const,
};

// ── Queries ──────────────────────────────────────────────────────
export function useRooms() {
  return useQuery<RoomRecord[]>({
    queryKey: roomKeys.list(),
    queryFn: async () => {
      const res = await api.rooms.getAllRooms();
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
  });
}

export function useRoom(roomId: string) {
  return useQuery<RoomRecord>({
    queryKey: roomKeys.detail(roomId),
    queryFn: async () => {
      const res = await api.rooms.getRoomById(roomId);
      if (!res.ok) throw new Error("Failed to fetch room");
      return res.json();
    },
    enabled: !!roomId,
  });
}

export function useUserHostedRooms(userId: string) {
  return useQuery<RoomRecord[]>({
    queryKey: roomKeys.hosted(userId),
    queryFn: async () => {
      const res = await api.rooms.getHostedRoomsByUserId(userId);
      if (!res.ok) throw new Error("Failed to fetch hosted rooms");
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useRoomVideoState(roomId: string) {
  return useQuery<{ currentVideoId?: string; previousVideoId?: string }>({
    queryKey: roomKeys.videoState(roomId),
    queryFn: async () => {
      const res = await api.rooms.getRoomVideoState(roomId);
      if (!res.ok) throw new Error("Failed to fetch room video state");
      return res.json();
    },
    enabled: !!roomId,
  });
}

// ── Mutations ────────────────────────────────────────────────────
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      type: "PUBLIC" | "PRIVATE" | "FRIENDS";
      memberIds?: string[];
      maxMembers?: number;
    }) => {
      const res = await api.rooms.createRoom(data);
      if (!res.ok) throw new Error("Failed to create room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RoomUpdateInput & { memberIds?: string[] };
    }) => {
      const res = await api.rooms.updateRoom(id, data);
      if (!res.ok) throw new Error("Failed to update room");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await api.rooms.deleteRoom(roomId);
      if (!res.ok) throw new Error("Failed to delete room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await api.rooms.joinRoom(roomId);
      if (!res.ok) throw new Error("Failed to join room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await api.rooms.leaveRoom(roomId);
      if (!res.ok) throw new Error("Failed to leave room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useToggleRoomFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const res = await api.rooms.toggleRoomFavorite(roomId);
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: roomKeys.all });
      const previousRooms = queryClient.getQueryData<RoomRecord[]>(
        roomKeys.list()
      );
      return { previousRooms };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(roomKeys.list(), context.previousRooms);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateRoomCurrentVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      currentVideoId,
      title,
    }: {
      roomId: string;
      currentVideoId: string;
      title?: string;
    }) => {
      const res = await api.rooms.updateRoomCurrentVideo(roomId, {
        currentVideoId,
        title,
      });
      if (!res.ok) throw new Error("Failed to update current video");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: roomKeys.videoState(variables.roomId),
      });
      queryClient.invalidateQueries({
        queryKey: roomKeys.detail(variables.roomId),
      });
    },
  });
}

export function useUpdatePreviousVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      previousVideoId,
      currentVideoId,
    }: {
      roomId: string;
      previousVideoId: string;
      currentVideoId?: string;
    }) => {
      const res = await api.rooms.updateRoomPreviousVideo(roomId, {
        previousVideoId,
        currentVideoId,
      });
      if (!res.ok) throw new Error("Failed to update previous video");
      return res.json();
    },
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: roomKeys.videoState(_variables.roomId),
      });
    },
  });
}
