"use client";

import ChatMain from "@/components/chat/chat-main";
import { useSession } from "@/lib/auth/auth-client";
import { Loader } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-light-royal-blue" />
          </div>
          <p className="text-light-bluish-gray mt-4 text-sm">
            Loading your messages...
          </p>
        </div>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Chat not found
          </h3>
          <p className="text-light-bluish-gray text-sm mb-6 max-w-sm">
            The conversation you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push("/messages")}
            className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
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
