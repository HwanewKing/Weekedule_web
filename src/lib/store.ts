"use client";

import { create } from "zustand";
import { CalendarEvent } from "@/types/event";

interface WeekedualeStore {
  events: CalendarEvent[];
  weeklyGoal: string;

  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setWeeklyGoal: (text: string) => void;
}

const SEED_EVENTS: CalendarEvent[] = [
  { id: "1", title: "알고리즘 수업",      dayOfWeek: 0, startTime: "09:30", endTime: "11:30", category: "class",    location: "Room 402" },
  { id: "2", title: "팀 미팅",            dayOfWeek: 1, startTime: "12:15", endTime: "13:15", category: "meeting",  attendees: ["김지수", "이민준"] },
  { id: "3", title: "디자인 싱크",         dayOfWeek: 2, startTime: "10:00", endTime: "11:00", category: "meeting" },
  { id: "4", title: "점심 휴식",           dayOfWeek: 2, startTime: "13:00", endTime: "14:00", category: "break" },
  { id: "5", title: "딥워크: 아키텍처",    dayOfWeek: 3, startTime: "14:00", endTime: "16:30", category: "deepwork", description: "스키마 문서화 집중 작업" },
  { id: "6", title: "요가 세션",           dayOfWeek: 4, startTime: "17:00", endTime: "18:00", category: "personal" },
];

export const useWeekedualeStore = create<WeekedualeStore>((set) => ({
  events: SEED_EVENTS,
  weeklyGoal: "오케스트레이션 엔진 문서를 완성하고 금요일 싱크를 위한 프로토타입을 준비한다.",

  addEvent: (event) =>
    set((s) => ({ events: [...s.events, event] })),
  updateEvent: (id, updates) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  setWeeklyGoal: (text) => set({ weeklyGoal: text }),
}));
