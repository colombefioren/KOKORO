import api from "@/lib/api";
import { CreateChat } from "@/types/chat";


export const getChats = async () => {
  try {
    const res = await api.chats.getUserChats();
    if (!res.ok) throw new Error("Failed to fetch chats");
    return res.json();
  } catch (err) {
    console.error("[getChats] Error:", err);
    throw err;
  }
};

export const getMessages = async (chatId: string) => {
  try {
    const res = await api.chats.getChatMessages(chatId);
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  } catch (err) {
    console.error("[getMessages] Error:", err);
    throw err;
  }
};

export const createChat = async (data: CreateChat) => {
  try {
    const res = await api.chats.createChat(data);
    if (!res.ok) throw new Error("Failed to create chat");
    return res.json();
  } catch (err) {
    console.error("[createChat] Error:", err);
    throw err;
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    const res = await api.chats.softDeleteChat(chatId);
    if (!res.ok) throw new Error("Failed to delete chat");
    return res.json();
  } catch (err) {
    console.error("[deleteChat] Error:", err);
    throw err;
  }
};

export const getChatById = async (chatId: string) => {
  const res = await api.chats.getChatById(chatId);
  if (!res.ok) throw new Error("Failed to fetch chat");
  return res.json();
};

export const getPrivateChats = async () => {
  try {
    const res = await api.chats.getPrivateChats();
    if (!res.ok) throw new Error("Failed to fetch private chats");
    return res.json();
  } catch (err) {
    console.error("[getPrivateChats] Error:", err);
    throw err;
  }
};

export const findOrRestoreChat = async (otherUserId: string) => {
  try {
    const res = await api.chats.findOrRestoreChat({ otherUserId });
    if (!res.ok) throw new Error("Failed to find or restore chat");
    return res.json();
  } catch (err) {
    console.error("[findOrRestoreChat] Error:", err);
    throw err;
  }
};

export const sendMessage = async (
  chatId: string,
  data: { content?: string; imageUrl?: string }
) => {
  try {
    const res = await api.chats.sendMessage(chatId, data);
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  } catch (err) {
    console.error("[sendMessage] Error:", err);
    throw err;
  }
};


