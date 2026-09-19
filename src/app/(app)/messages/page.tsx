"use client";

import { useRouter } from "next/navigation";
import MobileChatList from "@/components/chat/mobile-chat-list";
import { useSession } from "@/lib/auth/auth-client";
import { Loader, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

const MessagesPage = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectChat = (chatId: string) => {
    router.push(`/messages/${chatId}`);
  };

  if (isPending || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <Loader className="w-10 h-10 text-light-royal-blue animate-spin" />
        <p className="text-light-bluish-gray mt-4 text-sm">
          Loading your messages...
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        <MobileChatList
          currentUserId={session.user.id}
          onSelectChat={handleSelectChat}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <div className="text-center p-8 max-w-md">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10">
          <MessageCircle className="w-6 h-6 text-light-royal-blue" />
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">
          Select a conversation
        </h3>
        <p className="text-light-bluish-gray text-sm leading-relaxed">
          Choose a chat from the sidebar to start messaging or start a new
          conversation with friends.
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
