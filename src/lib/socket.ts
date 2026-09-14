import { io, Socket } from "socket.io-client";
import { User } from "@/types/user";
import { RoomRecord } from "@/types/room";
import { Chat, Message } from "@/types/chat";
import { VideoState } from "@/types/youtube";

// ── Typed Event Map ──────────────────────────────────────────────
// Using Record<string, any[]> for events where existing components
// emit varied payloads; typed events for new code to consume.
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
  "invited-to-room": (room: RoomRecord) => void;

  // Chat events
  "receive-message": (message: Message) => void;
  "receive-chat": (chat: Chat) => void;
  "chat-deleted": (chatId: string) => void;

  // Friend events — keep any[] to match legacy emit shapes
  "receive-friend-request": (...args: any[]) => void;
  "friend-request-accepted": (...args: any[]) => void;
  "friend-request-declined": (...args: any[]) => void;
  "friend-removed": (...args: any[]) => void;
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
  "toggle-favorite": (...args: any[]) => void;
  "create-public-room": (...args: any[]) => void;
  "invited-to-room": (data: { userId: string; room: RoomRecord }) => void;

  // Chat events
  "join-chat": (data: { chatId: string }) => void;
  "send-message": (data: any) => void;
  "open-chat": (...args: any[]) => void;
  "delete-chat": (...args: any[]) => void;

  // Friend events — keep any[] to match legacy emit shapes
  "send-friend-request": (...args: any[]) => void;
  "accept-friend-request": (...args: any[]) => void;
  "decline-friend-request": (...args: any[]) => void;
  "remove-friend": (...args: any[]) => void;

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
