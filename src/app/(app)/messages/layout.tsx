import { ReactNode } from "react";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/chat/chat-sidebar";

interface MessagesLayoutProps {
  children: ReactNode;
}

export default async function MessagesLayout({
  children,
}: MessagesLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="flex flex-1 overflow-hidden border border-light-royal-blue/10 rounded-3xl my-4 shadow-2xl">
        <ChatSidebar currentUserId={session.user.id} />
        {children}
      </div>
    </div>
  );
}
