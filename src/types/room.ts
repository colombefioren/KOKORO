import { User } from "@/types/user";
import { Chat } from "./chat";

export type RoomType = "PUBLIC" | "PRIVATE" | "FRIENDS";
export type RoomRole = "HOST" | "MEMBER";

export type RoomMember = {
  id: string;
  userId: string;
  roomId: string;
  role: RoomRole;
  joinedAt: string;
  user: User;
  isFavorite: boolean;
  currentVideoId?: string;
  previousVideoId?: string;
};

export type RoomRecord = {
  id: string;
  name: string;
  type: RoomType;
  description?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  maxMembers?: number | null;
  isActive: boolean;
  chat?: Chat | null;
  members: RoomMember[];
};

export type RoomUpdateInput = {
  name?: string;
  description?: string;
  isFavorite?: boolean;
  isActive?: boolean;
  maxMembers?: number;
};
