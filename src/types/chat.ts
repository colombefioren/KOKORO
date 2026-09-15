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
};

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user: { id: string; name: string; image?: string | null };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content?: string;
  createdAt: string;
  sender: User;
  imageUrl?: string | null;
  deletedAt?: string | null;
  reactions?: MessageReaction[];
}
