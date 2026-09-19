"use client";

import ChatMain from "@/components/chat/chat-main";
import { useSession } from "@/lib/auth/auth-client";
import { Loader, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-base mb-2">
            Chat not found
          </h3>
          <p className="text-light-bluish-gray text-sm mb-6 max-w-sm">
            The conversation you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push("/messages")}
            className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatMain
        currentUserId={session.user.id}
        chatId={chatId}
        isMobile={isMobile}
        onBack={() => router.push("/messages")}
      />
    </div>
  );
};

export default ChatPage;
