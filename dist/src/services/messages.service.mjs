"use strict";
"use server";
import prisma from "../lib/db/prisma.mjs";
export const socketSendMessage = async (data) => {
    const { chatId, senderId, content, imageUrl } = data;
    if (!content && !imageUrl) {
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
            content,
            imageUrl,
        },
        include: {
            sender: true,
        },
    });
    await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
    });
    return message;
};
