"use client";

import { create } from "zustand";
import { NotificationPayload } from "@/lib/socket";

interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  hasLoaded: boolean;
  setNotifications: (
    notifications: NotificationPayload[],
    unreadCount: number,
  ) => void;
  addNotification: (notification: NotificationPayload) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  hasLoaded: false,
  setNotifications: (notifications, unreadCount) =>
    set({ notifications, unreadCount, hasLoaded: true }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  markRead: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === id);
      if (!target || target.isRead) return state;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),
}));
