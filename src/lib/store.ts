"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CalendarEvent } from "@/types/event";

interface WeekedualeStore {
  events: CalendarEvent[];
  weeklyGoal: string;

  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  setWeeklyGoal: (text: string) => void;
}

// DB 응답 → CalendarEvent 정규화 (categoryId→category, groupId 포함)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(e: any): CalendarEvent {
  return {
    ...e,
    category: e.categoryId ?? e.category ?? "",
    groupId:  e.groupId ?? undefined,
  };
}

export const useWeekedualeStore = create<WeekedualeStore>()(
  persist(
    (set, get) => ({
      events: [],
      weeklyGoal: "",

      fetchEvents: async () => {
        const res = await fetch("/api/events");
        if (!res.ok) return;
        const data = await res.json();
        // DB는 categoryId 필드로 반환 → 프론트 CalendarEvent의 category로 변환
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const events = (data.events ?? []).map((e: any) => normalizeEvent(e));
        set({ events });
      },

      addEvent: async (event) => {
        // 낙관적 업데이트
        const tempId = crypto.randomUUID();
        set((s) => ({ events: [...s.events, { ...event, id: tempId } as CalendarEvent] }));
        try {
          // 프론트 category → API categoryId 로 변환해서 전송
          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...event, categoryId: event.category, category: undefined }),
          });
          if (res.ok) {
            const data = await res.json();
            const normalized = normalizeEvent(data.event);
            set((s) => ({
              events: s.events.map((e) => (e.id === tempId ? normalized : e)),
            }));
          } else {
            set((s) => ({ events: s.events.filter((e) => e.id !== tempId) }));
          }
        } catch {
          set((s) => ({ events: s.events.filter((e) => e.id !== tempId) }));
        }
      },

      updateEvent: async (id, updates) => {
        const prev = get().events;
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        try {
          // category → categoryId 변환
          const { category, ...rest } = updates as Partial<CalendarEvent> & { category?: string };
          const payload = { ...rest, ...(category !== undefined ? { categoryId: category } : {}) };
          const res = await fetch(`/api/events/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) set({ events: prev });
        } catch {
          set({ events: prev });
        }
      },

      deleteEvent: async (id) => {
        const prev = get().events;
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
        try {
          const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
          if (!res.ok) set({ events: prev });
        } catch {
          set({ events: prev });
        }
      },

      deleteGroup: async (groupId) => {
        const targets = get().events.filter((e) => e.groupId === groupId);
        const prev = get().events;
        set((s) => ({ events: s.events.filter((e) => e.groupId !== groupId) }));
        try {
          await Promise.all(
            targets.map((e) => fetch(`/api/events/${e.id}`, { method: "DELETE" }))
          );
        } catch {
          set({ events: prev });
        }
      },

      setWeeklyGoal: (text) => set({ weeklyGoal: text }),
    }),
    {
      name: "weekedule-events",
      // weeklyGoal만 로컬에 유지 (events는 서버에서 로드)
      partialize: (s) => ({ weeklyGoal: s.weeklyGoal }),
    }
  )
);
