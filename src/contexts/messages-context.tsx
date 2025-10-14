"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MessagesContextType {
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  showChatList: boolean;
  setShowChatList: (show: boolean) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export function MessagesProvider({
  children,
  initialChatId,
}: {
  children: ReactNode;
  initialChatId?: string;
}) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    initialChatId || null
  );
  const [showChatList, setShowChatList] = useState(!initialChatId);

  const handleSetCurrentChatId = (chatId: string | null) => {
    setCurrentChatId(chatId);
    setShowChatList(!chatId);
  };

  const handleSetShowChatList = (show: boolean) => {
    setShowChatList(show);
    if (show) {
      setCurrentChatId(null);
    }
  };

  return (
    <MessagesContext.Provider
      value={{
        currentChatId,
        setCurrentChatId: handleSetCurrentChatId,
        showChatList,
        setShowChatList: handleSetShowChatList,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
