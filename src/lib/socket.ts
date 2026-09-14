import { io, Socket } from "socket.io-client";
import { RoomRecord } from "@/types/room";
import { Chat, Message } from "@/types/chat";
import { VideoState } from "@/types/youtube";

// ── Typed Event Map ──────────────────────────────────────────────
// Using `unknown` instead of `any` for legacy friend/chat event payloads
// where existing components emit varied shapes.
export interface ServerToClientEvents {
  // Room events
  "new-video-state": (state: VideoState) => void;
  "video-changed": (data: VideoState & { previousVideoId?: string }) => void;
  "favorite-toggled": (data: {
    room: RoomRecord;
    isFavorite: boolean;
    userId: string;
  }) => void;
  "public-room-created": (room: RoomRecord) => void;
  "invited-to-room": (room: { id: string; name: string }) => void;

  // Chat events
  "receive-message": (message: Message) => void;
  "receive-chat": (chat: Chat) => void;
  "chat-deleted": (chatId: string) => void;

  // Friend events
  "receive-friend-request": (data: Record<string, unknown>) => void;
  "friend-request-accepted": (data: Record<string, unknown>) => void;
  "friend-request-declined": (data: Record<string, unknown>) => void;
  "friend-removed": (data: Record<string, unknown>) => void;
}

export interface ClientToServerEvents {
  // Room events
  "join-room": (data: {
    roomId: string;
    userId: string;
    isHost: boolean;
  }) => void;
  "leave-room": (data: { roomId: string; userId: string }) => void;
  "update-video-state": (state: VideoState) => void;
  "change-video": (data: {
    roomId: string;
    videoId: string;
    previousVideoId?: string;
    lastUpdatedBy?: string;
  }) => void;
  "request-video-state": (data: { roomId: string }) => void;
  "toggle-favorite": (data: Record<string, unknown>) => void;
  "create-public-room": (data: Record<string, unknown>) => void;
  "invited-to-room": (data: { userId: string; room: { id: string; name: string } }) => void;

  // Chat events
  "join-chat": (data: { chatId: string }) => void;
  "send-message": (data: Record<string, unknown>) => void;
  "open-chat": (data: Record<string, unknown>) => void;
  "delete-chat": (data: Record<string, unknown>) => void;

  // Friend events
  "send-friend-request": (data: Record<string, unknown>) => void;
  "accept-friend-request": (data: Record<string, unknown>) => void;
  "decline-friend-request": (data: Record<string, unknown>) => void;
  "remove-friend": (data: Record<string, unknown>) => void;

  // User
  join: (data: { userId: string }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (socketInstance) return socketInstance;

  socketInstance = io(
    typeof window !== "undefined"
      ? process.env.NEXT_SOCKET_BASE_URL || window.location.origin
      : "",
    {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    }
  );

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
