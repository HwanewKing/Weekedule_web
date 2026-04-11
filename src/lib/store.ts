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
  setWeeklyGoal: (text: string) => void;
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
        set({ events: data.events ?? [] });
      },

      addEvent: async (event) => {
        // 낙관적 업데이트
        const tempId = crypto.randomUUID();
        set((s) => ({ events: [...s.events, { ...event, id: tempId } as CalendarEvent] }));
        try {
          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          });
          if (res.ok) {
            const data = await res.json();
            set((s) => ({
              events: s.events.map((e) => (e.id === tempId ? data.event : e)),
            }));
          } else {
            // 롤백
            set((s) => ({ events: s.events.filter((e) => e.id !== tempId) }));
          }
        } catch {
          set((s) => ({ events: s.events.filter((e) => e.id !== tempId) }));
        }
      },

      updateEvent: async (id, updates) => {
        // 낙관적 업데이트
        const prev = get().events;
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        try {
          const res = await fetch(`/api/events/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
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

      setWeeklyGoal: (text) => set({ weeklyGoal: text }),
    }),
    {
      name: "weekedule-events",
      // weeklyGoal만 로컬에 유지 (events는 서버에서 로드)
      partialize: (s) => ({ weeklyGoal: s.weeklyGoal }),
    }
  )
);
