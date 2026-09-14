"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = (data: any) => {
      const notification: Notification = {
        id: `fr-${Date.now()}`,
        type: "FRIEND_REQUEST",
        title: `${data.friendRequest?.name || "Someone"} sent you a friend request`,
        link: "/profile",
        isRead: false,
        metadata: data,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleRoomInvite = (room: any) => {
      const notification: Notification = {
        id: `ri-${Date.now()}`,
        type: "ROOM_INVITE",
        title: `You were invited to room "${room.name}"`,
        link: `/rooms/${room.id}`,
        isRead: false,
        metadata: { room },
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("receive-friend-request", handleFriendRequest);
    socket.on("invited-to-room", handleRoomInvite);

    return () => {
      socket.off("receive-friend-request", handleFriendRequest);
      socket.off("invited-to-room", handleRoomInvite);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notification.id] }),
      });
    }

    if (notification.link) {
      router.push(notification.link);
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "FRIEND_REQUEST":
        return "👤";
      case "ROOM_INVITE":
        return "🏠";
      case "MENTION":
        return "💬";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
      >
        <Bell className="w-5 h-5 text-light-bluish-gray" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink text-[9px] font-bold text-white rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-darkblue border border-light-royal-blue/20 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-light-royal-blue/15">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-light-royal-blue text-[11px] hover:text-light-royal-blue/80 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-light-bluish-gray/50 mx-auto mb-2" />
                <p className="text-light-bluish-gray text-xs">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left p-4 border-b border-light-royal-blue/10 hover:bg-white/5 transition-colors flex gap-3",
                    !notification.isRead && "bg-light-royal-blue/5"
                  )}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs leading-relaxed",
                      notification.isRead ? "text-light-bluish-gray" : "text-white"
                    )}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-light-bluish-gray/70 text-[11px] mt-1 truncate">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-light-bluish-gray/50 text-[10px] mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-light-royal-blue rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
