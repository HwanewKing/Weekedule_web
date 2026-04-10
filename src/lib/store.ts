"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CalendarEvent } from "@/types/event";

interface WeekedualeStore {
  events: CalendarEvent[];
  weeklyGoal: string;

  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setWeeklyGoal: (text: string) => void;
}

export const useWeekedualeStore = create<WeekedualeStore>()(
  persist(
    (set) => ({
      events: [],
      weeklyGoal: "",

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),
      updateEvent: (id, updates) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      setWeeklyGoal: (text) => set({ weeklyGoal: text }),
    }),
    { name: "weekedule-events" }
  )
);
