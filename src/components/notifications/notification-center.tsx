"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  UserPlus,
  UserCheck,
  DoorOpen,
  Crown,
  MessageCircle,
  AtSign,
} from "lucide-react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationPayload } from "@/lib/socket";

type Notification = NotificationPayload;

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
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
          const data: NotificationsResponse = await res.json();
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

    const handleNewNotification = (notification: NotificationPayload) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
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
        return UserPlus;
      case "FRIEND_ACCEPTED":
        return UserCheck;
      case "ROOM_INVITE":
      case "ROOM_JOINED":
        return DoorOpen;
      case "ROOM_HOST_TRANSFER":
        return Crown;
      case "MESSAGE":
        return MessageCircle;
      case "MENTION":
        return AtSign;
      default:
        return Bell;
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
                    !notification.isRead && "bg-light-royal-blue/5",
                  )}
                >
                  {(() => {
                    const Icon = getIcon(notification.type);
                    return (
                      <span className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-light-royal-blue/15 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-light-royal-blue" />
                      </span>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs leading-relaxed",
                        notification.isRead
                          ? "text-light-bluish-gray"
                          : "text-white",
                      )}
                    >
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
