"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationType =
  | "friend_request"
  | "room_invite"
  | "meeting_confirmed"
  | "member_joined"
  | "schedule_conflict";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // ISO string
  read: boolean;
  actionable?: boolean;
  meta?: {
    roomId?: string;
    roomName?: string;
    fromName?: string;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "time" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  acceptAction: (id: string) => void;
  declineAction: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: crypto.randomUUID(),
              time: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ],
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismiss: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      acceptAction: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true, actionable: false } : n
          ),
        })),

      declineAction: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: "weekedule-notifications" }
  )
);
