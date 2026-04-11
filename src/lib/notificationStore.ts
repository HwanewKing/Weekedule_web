"use client";

import { create } from "zustand";

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
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],

  fetchNotifications: async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    set({
      notifications: (data.notifications ?? []).map((n: Notification & { time: Date }) => ({
        ...n,
        time: typeof n.time === "string" ? n.time : new Date(n.time).toISOString(),
      })),
    });
  },

  markRead: async (id) => {
    const prev = get().notifications;
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) set({ notifications: prev });
    } catch {
      set({ notifications: prev });
    }
  },

  markAllRead: async () => {
    const prev = get().notifications;
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (!res.ok) set({ notifications: prev });
    } catch {
      set({ notifications: prev });
    }
  },

  dismiss: async (id) => {
    const prev = get().notifications;
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) set({ notifications: prev });
    } catch {
      set({ notifications: prev });
    }
  },
}));
