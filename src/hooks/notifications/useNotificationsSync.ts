"use client";

import { useEffect } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationPayload } from "@/lib/socket";

interface NotificationsResponse {
  notifications: NotificationPayload[];
  unreadCount: number;
}

export function useNotificationsSync() {
  const socket = useSocketStore((state) => state.socket);
  const user = useUserStore((state) => state.user);
  const hasLoaded = useNotificationStore((state) => state.hasLoaded);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    if (!user || hasLoaded) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data: NotificationsResponse = await res.json();
          setNotifications(data.notifications, data.unreadCount);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [user, hasLoaded, setNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: NotificationPayload) => {
      addNotification(notification);
    };

    socket.on("new-notification", handleNewNotification);
    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, addNotification]);
}
