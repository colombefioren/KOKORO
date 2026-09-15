import { User } from "@/types/user";
import { Chat } from "./chat";

export type RoomType = "PUBLIC" | "PRIVATE" | "FRIENDS";
export type RoomMode = "HOST_CONTROLLED" | "FREE_FOR_ALL";
export type RoomRole = "HOST" | "MEMBER";

export type RoomMember = {
  id: string;
  userId: string;
  roomId: string;
  role: RoomRole;
  joinedAt: string;
  user: User;
  room: RoomRecord;
  isFavorite: boolean;
  currentVideoId?: string;
  previousVideoId?: string;
};

export type RoomRecord = {
  id: string;
  name: string;
  type: RoomType;
  mode: RoomMode;
  description?: string | null;
  thumbnailUrl?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  maxMembers?: number | null;
  chat?: Chat | null;
  isFavorite?: boolean;
  members: RoomMember[];
  currentVideoId?: string;
  previousVideoId?: string;
};

export type RoomUpdateInput = {
  name?: string;
  description?: string;
  isFavorite?: boolean;
  isActive?: boolean;
  maxMembers?: number;
};
