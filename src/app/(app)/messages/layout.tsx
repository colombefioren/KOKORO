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
    <div className="flex lg:h-screen h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex flex-1 overflow-hidden border border-white/10 rounded-2xl my-4 bg-darkblue">
        <div className="hidden lg:block">
          <ChatSidebar currentUserId={session.user.id} />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
