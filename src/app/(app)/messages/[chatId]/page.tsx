"use server"

import ChatMain from "@/components/chat/chat-main";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const { chatId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  if (!chatId) {
    notFound();
  }

  return <ChatMain currentUserId={session.user.id} chatId={chatId} />;
};

export default ChatPage;