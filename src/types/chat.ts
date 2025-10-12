import { User } from "@/types/user";

export interface ChatMember {
  id: string;
  userId: string;
  deletedAt?: string | null;
  user: User;
}

export interface Chat {
  id: string;
  type: "PRIVATE" | "ROOM";
  name?: string | null;
  members: ChatMember[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}


export type CreateChat = {
  type: "PRIVATE" | "ROOM";
  memberIds: string[];
  name?: string;
}
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  createdAt: string;
  sender: User;
  imageUrl?: string | null;
}
