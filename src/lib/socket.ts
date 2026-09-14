import { io, Socket } from "socket.io-client";
import { RoomRecord } from "@/types/room";
import { Chat, Message } from "@/types/chat";
import { VideoState } from "@/types/youtube";
import { FriendRecord, FriendRequester, User } from "@/types/user";

// ── Shared Payload Types ─────────────────────────────────────────
export interface SendFriendRequestPayload {
  receiverId: string;
  friendRequest: FriendRequester;
}

export interface FriendRequestAcceptedPayload {
  to: string;
  from: string;
  friendship: FriendRecord;
  friend: User;
}

export interface FriendRemovedPayload {
  to: string;
  from: string;
  friendship: FriendRecord;
}

export type SendMessagePayload = Message;

export interface OpenChatPayload {
  chat: Chat;
  to: string;
  from?: string;
}

export interface DeleteChatPayload {
  chatId: string;
}

// ── Typed Event Map ──────────────────────────────────────────────
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

  // Friend events
  "receive-friend-request": (data: SendFriendRequestPayload) => void;
  "friend-request-accepted": (data: FriendRequestAcceptedPayload) => void;
  "friend-request-declined": (data: FriendRequester) => void;
  "friend-removed": (data: FriendRemovedPayload) => void;
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
  "toggle-favorite": (room: RoomRecord) => void;
  "create-public-room": (room: RoomRecord) => void;
  "invited-to-room": (data: { userId: string; room: RoomRecord }) => void;

  // Chat events
  "join-chat": (data: { chatId: string }) => void;
  "send-message": (data: SendMessagePayload) => void;
  "open-chat": (data: OpenChatPayload) => void;
  "delete-chat": (data: DeleteChatPayload) => void;

  // Friend events
  "send-friend-request": (data: SendFriendRequestPayload) => void;
  "accept-friend-request": (data: FriendRequestAcceptedPayload) => void;
  "decline-friend-request": (data: FriendRequester) => void;
  "remove-friend": (data: FriendRemovedPayload) => void;

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
