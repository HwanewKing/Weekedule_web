"use client";

import { create } from "zustand";
import { NotificationType } from "./notificationStore";

export type Theme    = "light" | "dark" | "system";
export type Language = "ko" | "en";

export interface SettingsStore {
  startOfWeek: "mon" | "sun";
  setStartOfWeek: (v: "mon" | "sun") => void;
  showWeekends: boolean;
  setShowWeekends: (v: boolean) => void;
  gridStart: number;
  gridEnd: number;
  setGridStart: (v: number) => void;
  setGridEnd: (v: number) => void;

  theme: Theme;
  setTheme: (v: Theme) => void;
  language: Language;
  setLanguage: (v: Language) => void;

  notifEnabled: Record<NotificationType, boolean>;
  setNotifEnabled: (type: NotificationType, value: boolean) => void;

  fetchSettings: () => Promise<void>;
}

const DEFAULT_NOTIF: Record<NotificationType, boolean> = {
  friend_request:    true,
  room_invite:       true,
  meeting_confirmed: true,
  member_joined:     true,
  schedule_conflict: true,
};

async function patchSettings(data: Record<string, unknown>) {
  try {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // 무시 (낙관적 업데이트 유지)
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  startOfWeek: "mon",
  showWeekends: true,
  gridStart: 8,
  gridEnd: 22,
  theme: "system",
  language: "ko",
  notifEnabled: DEFAULT_NOTIF,

  fetchSettings: async () => {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    const s = data.settings;
    if (!s) return;
    set({
      startOfWeek: s.startOfWeek ?? "mon",
      showWeekends: s.showWeekends ?? true,
      gridStart: s.gridStart ?? 8,
      gridEnd: s.gridEnd ?? 22,
      theme: s.theme ?? "system",
      language: s.language ?? "ko",
      notifEnabled: s.notifJson ? { ...DEFAULT_NOTIF, ...JSON.parse(s.notifJson) } : DEFAULT_NOTIF,
    });
  },

  setStartOfWeek: (v) => { set({ startOfWeek: v }); patchSettings({ startOfWeek: v }); },
  setShowWeekends: (v) => { set({ showWeekends: v }); patchSettings({ showWeekends: v }); },
  setGridStart: (v) => { set({ gridStart: v }); patchSettings({ gridStart: v }); },
  setGridEnd: (v) => { set({ gridEnd: v }); patchSettings({ gridEnd: v }); },
  setTheme: (v) => { set({ theme: v }); patchSettings({ theme: v }); },
  setLanguage: (v) => { set({ language: v }); patchSettings({ language: v }); },
  setNotifEnabled: (type, value) => {
    set((s) => {
      const notifEnabled = { ...s.notifEnabled, [type]: value };
      patchSettings({ notifJson: JSON.stringify(notifEnabled) });
      return { notifEnabled };
    });
  },
}));
