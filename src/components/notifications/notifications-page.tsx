"use client";

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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationPayload } from "@/lib/socket";
import { useNotificationStore } from "@/store/useNotificationStore";

type Notification = NotificationPayload;

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

const NotificationsPage = () => {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const markRead = useNotificationStore((state) => state.markRead);

  const handleMarkAllRead = async () => {
    markAllRead();
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [notification.id] }),
      });
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="flex-1 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Notifications
          </h1>
          <p className="text-light-bluish-gray text-sm">
            Friend requests, room invites, and everything else in one place
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-4 py-2.5 flex-shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/8 bg-darkblue">
          <Bell className="w-10 h-10 text-light-bluish-gray/40 mb-3" />
          <p className="text-light-bluish-gray text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-darkblue overflow-hidden">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "w-full text-left p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors flex gap-3",
                  !notification.isRead && "bg-light-royal-blue/5",
                )}
              >
                <span className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-light-royal-blue/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-light-royal-blue" />
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      notification.isRead
                        ? "text-light-bluish-gray"
                        : "text-white",
                    )}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-light-bluish-gray/70 text-xs mt-1">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-light-bluish-gray/50 text-xs mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-light-royal-blue rounded-full flex-shrink-0 mt-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
