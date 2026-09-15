import { io, Socket } from "socket.io-client";
import { RoomRecord } from "@/types/room";
import { Chat, Message } from "@/types/chat";
import { VideoState } from "@/types/youtube";
import { FriendRecord, FriendRequester, User } from "@/types/user";

export interface NotificationPayload {
  id: string;
  userId: string;
  type:
    | "FRIEND_REQUEST"
    | "FRIEND_ACCEPTED"
    | "ROOM_INVITE"
    | "ROOM_JOINED"
    | "ROOM_HOST_TRANSFER"
    | "MESSAGE"
    | "MENTION"
    | "SYSTEM";
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

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

// Not every producer of "invited-to-room" has a full RoomRecord on hand
// (e.g. inviting to an already-existing room only has id + name), so the
// event carries the smallest shape every consumer actually needs.
export interface InvitedRoomInfo {
  id: string;
  name: string;
}

// ── Voice chat ────────────────────────────────────────────────────
export interface VoiceParticipant {
  userId: string;
  name: string;
  image: string | null;
  muted: boolean;
  cameraOn: boolean;
}

export type VoiceSignal =
  | { kind: "offer"; description: RTCSessionDescriptionInit }
  | { kind: "answer"; description: RTCSessionDescriptionInit }
  | { kind: "ice-candidate"; candidate: RTCIceCandidateInit };

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
  "invited-to-room": (room: InvitedRoomInfo) => void;
  "member-joined-room": (data: { roomId: string; user: User }) => void;
  "host-transferred": (data: { roomId: string; newHostId: string }) => void;
  "room-mode-changed": (data: {
    roomId: string;
    mode: "HOST_CONTROLLED" | "FREE_FOR_ALL";
  }) => void;

  // Chat events
  "receive-message": (message: Message) => void;
  "receive-chat": (chat: Chat) => void;
  "chat-deleted": (chatId: string) => void;
  "message-deleted": (data: { chatId: string; messageId: string }) => void;

  // Friend events
  "receive-friend-request": (data: SendFriendRequestPayload) => void;
  "friend-request-accepted": (data: FriendRequestAcceptedPayload) => void;
  "friend-request-declined": (data: FriendRequester) => void;
  "friend-removed": (data: FriendRemovedPayload) => void;

  // Presence
  "presence-changed": (data: {
    userId: string;
    isOnline: boolean;
    lastSeenAt: string;
  }) => void;

  // Notifications
  "new-notification": (notification: NotificationPayload) => void;

  // Voice chat
  "voice-participants": (data: {
    roomId: string;
    participants: VoiceParticipant[];
  }) => void;
  "voice-peer-joined": (data: {
    roomId: string;
    participant: VoiceParticipant;
  }) => void;
  "voice-peer-left": (data: { roomId: string; userId: string }) => void;
  "voice-signal": (data: {
    roomId: string;
    fromUserId: string;
    signal: VoiceSignal;
  }) => void;
  "voice-state-changed": (data: {
    roomId: string;
    userId: string;
    muted: boolean;
    cameraOn: boolean;
  }) => void;
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
  "invited-to-room": (data: { userId: string; room: InvitedRoomInfo }) => void;
  "member-joined-room": (data: { roomId: string; user: User }) => void;
  "transfer-host": (data: { roomId: string; newHostId: string }) => void;
  "change-room-mode": (data: {
    roomId: string;
    mode: "HOST_CONTROLLED" | "FREE_FOR_ALL";
  }) => void;

  // Chat events
  "join-chat": (data: { chatId: string }) => void;
  "send-message": (data: SendMessagePayload) => void;
  "open-chat": (data: OpenChatPayload) => void;
  "delete-chat": (data: DeleteChatPayload) => void;
  "delete-message": (data: { chatId: string; messageId: string }) => void;

  // Friend events
  "send-friend-request": (data: SendFriendRequestPayload) => void;
  "accept-friend-request": (data: FriendRequestAcceptedPayload) => void;
  "decline-friend-request": (data: FriendRequester) => void;
  "remove-friend": (data: FriendRemovedPayload) => void;

  // User
  join: (data: { userId: string }) => void;

  // Voice chat
  "join-voice": (data: { roomId: string }) => void;
  "leave-voice": (data: { roomId: string }) => void;
  "voice-signal": (data: {
    roomId: string;
    toUserId: string;
    signal: VoiceSignal;
  }) => void;
  "voice-state-changed": (data: {
    roomId: string;
    muted: boolean;
    cameraOn: boolean;
  }) => void;
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
    },
  );

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
