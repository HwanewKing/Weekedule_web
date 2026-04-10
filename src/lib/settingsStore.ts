"use client";

import { create } from "zustand";
import { NotificationType } from "./notificationStore";

export type Theme    = "light" | "dark" | "system";
export type Language = "ko" | "en";

export interface SettingsStore {
  // 시간표
  startOfWeek: "mon" | "sun";
  setStartOfWeek: (v: "mon" | "sun") => void;
  showWeekends: boolean;
  setShowWeekends: (v: boolean) => void;
  gridStart: number; // 시 단위 (6~12)
  gridEnd: number;   // 시 단위 (18~24)
  setGridStart: (v: number) => void;
  setGridEnd: (v: number) => void;

  // 디스플레이
  theme: Theme;
  setTheme: (v: Theme) => void;
  language: Language;
  setLanguage: (v: Language) => void;

  // 알림
  notifEnabled: Record<NotificationType, boolean>;
  setNotifEnabled: (type: NotificationType, value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  startOfWeek: "mon",
  setStartOfWeek: (v) => set({ startOfWeek: v }),
  showWeekends: true,
  setShowWeekends: (v) => set({ showWeekends: v }),
  gridStart: 8,
  gridEnd: 22,
  setGridStart: (v) => set({ gridStart: v }),
  setGridEnd:   (v) => set({ gridEnd: v }),

  theme: "system",
  setTheme: (v) => set({ theme: v }),
  language: "ko",
  setLanguage: (v) => set({ language: v }),

  notifEnabled: {
    friend_request:    true,
    room_invite:       true,
    meeting_confirmed: true,
    member_joined:     true,
    schedule_conflict: true,
  },
  setNotifEnabled: (type, value) =>
    set((s) => ({ notifEnabled: { ...s.notifEnabled, [type]: value } })),
}));
