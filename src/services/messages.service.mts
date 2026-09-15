"use server";

import prisma from "../lib/db/prisma.mjs";
import { User } from "@/types/user";

interface SendMessagePayload {
  id?: string;
  chatId: string;
  senderId: string;
  content?: string;
  sender?: User;
  imageUrl?: string | null;
  createdAt?: string;
}

export const socketSendMessage = async (data: SendMessagePayload) => {
  const { chatId, senderId, content, imageUrl } = data;

  // Validate required fields
  if (!chatId || typeof chatId !== "string" || chatId.length > 100) {
    throw new Error("Invalid chat ID");
  }

  if (!senderId || typeof senderId !== "string" || senderId.length > 100) {
    throw new Error("Invalid sender ID");
  }

  // Sanitize content
  const sanitizedContent = typeof content === "string"
    ? content.slice(0, 5000).trim()
    : undefined;

  const sanitizedImageUrl = typeof imageUrl === "string"
    ? imageUrl.slice(0, 2000).trim()
    : undefined;

  if (!sanitizedContent && !sanitizedImageUrl) {
    throw new Error("Message must have content or image");
  }

  const isMember = await prisma.chatMember.findFirst({
    where: { chatId, userId: senderId, deletedAt: null },
  });

  if (!isMember) {
    throw new Error("User is not a member of this chat");
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId,
      content: sanitizedContent,
      imageUrl: sanitizedImageUrl,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          displayUsername: true,
          bio: true,
          isOnline: true,
          lastSeenAt: true,
          createdAt: true,
        },
      },
    },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return message;
};
