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
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-light-royal-blue"/>
          </div>
          <p className="text-light-bluish-gray mt-4 text-sm">
            Loading your messages...
          </p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <MobileChatList
            currentUserId={session.user.id}
            onSelectChat={handleSelectChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <div className="text-center p-8 max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-light-royal-blue/20 to-plum/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-light-royal-blue/30">
          <MessageCircle className="w-12 h-12 text-light-royal-blue" />
        </div>
        <h3 className="text-white text-2xl font-semibold mb-3">
          Select a conversation
        </h3>
        <p className="text-light-bluish-gray text-base mb-8 leading-relaxed">
          Choose a chat from the sidebar to start messaging or start a new
          conversation with friends.
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
