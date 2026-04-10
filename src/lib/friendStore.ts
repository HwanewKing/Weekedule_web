"use client";

import { create } from "zustand";
import { Friend, FriendRequest } from "@/types/friend";
import { CalendarEvent } from "@/types/event";

function ev(
  id: string,
  title: string,
  day: number,
  start: string,
  end: string,
  cat: CalendarEvent["category"] = "meeting"
): CalendarEvent {
  return { id, title, dayOfWeek: day, startTime: start, endTime: end, category: cat };
}

const SEED_FRIENDS: Friend[] = [
  {
    id: "f1",
    name: "김태현",
    initials: "김태",
    colorId: "blue",
    addedAt: new Date().toISOString(),
    events: [
      ev("f1-1", "운동",        0, "07:00", "08:00", "break"),
      ev("f1-2", "개발 수업",   0, "10:00", "12:00", "class"),
      ev("f1-3", "팀 회의",     1, "14:00", "15:00", "meeting"),
      ev("f1-4", "코딩 스터디", 2, "19:00", "21:00", "deepwork"),
      ev("f1-5", "수업",        3, "09:00", "11:00", "class"),
    ],
  },
  {
    id: "f2",
    name: "이수빈",
    initials: "이수",
    colorId: "pink",
    addedAt: new Date().toISOString(),
    events: [
      ev("f2-1", "디자인 작업",   0, "09:00", "13:00", "deepwork"),
      ev("f2-2", "점심 미팅",     1, "12:00", "13:00", "meeting"),
      ev("f2-3", "UI 리뷰",       2, "15:00", "16:30", "meeting"),
      ev("f2-4", "개인 프로젝트", 4, "18:00", "20:00", "deepwork"),
    ],
  },
  {
    id: "f3",
    name: "박준호",
    initials: "박준",
    colorId: "green",
    addedAt: new Date().toISOString(),
    events: [
      ev("f3-1", "수업",      1, "09:00", "11:00", "class"),
      ev("f3-2", "수업",      3, "09:00", "11:00", "class"),
      ev("f3-3", "연구 미팅", 2, "14:00", "15:00", "meeting"),
      ev("f3-4", "도서관",    4, "13:00", "17:00", "deepwork"),
    ],
  },
  {
    id: "f4",
    name: "최예진",
    initials: "최예",
    colorId: "violet",
    addedAt: new Date().toISOString(),
    events: [
      ev("f4-1", "마케팅 회의", 0, "10:00", "11:30", "meeting"),
      ev("f4-2", "콘텐츠 기획", 1, "14:00", "16:00", "deepwork"),
      ev("f4-3", "SNS 작업",    2, "09:00", "10:30", "deepwork"),
      ev("f4-4", "팀 싱크",     4, "15:00", "16:00", "meeting"),
    ],
  },
  {
    id: "f5",
    name: "정민재",
    initials: "정민",
    colorId: "orange",
    addedAt: new Date().toISOString(),
    events: [
      ev("f5-1", "알바",   0, "14:00", "20:00", "deepwork"),
      ev("f5-2", "알바",   2, "14:00", "20:00", "deepwork"),
      ev("f5-3", "수업",   1, "10:00", "12:00", "class"),
      ev("f5-4", "동아리", 3, "17:00", "19:00", "meeting"),
    ],
  },
];

const SEED_REQUESTS: FriendRequest[] = [
  {
    id: "req1",
    fromId: "req-f1",
    fromName: "안소현",
    fromInitials: "안소",
    sentAt: new Date().toISOString(),
  },
  {
    id: "req2",
    fromId: "req-f2",
    fromName: "홍기현",
    fromInitials: "홍기",
    sentAt: new Date().toISOString(),
  },
];

interface FriendStore {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  removeFriend: (id: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: SEED_FRIENDS,
  pendingRequests: SEED_REQUESTS,

  removeFriend: (id) =>
    set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

  acceptRequest: (requestId) =>
    set((s) => {
      const req = s.pendingRequests.find((r) => r.id === requestId);
      if (!req) return s;
      const newFriend: Friend = {
        id: req.fromId,
        name: req.fromName,
        initials: req.fromInitials,
        colorId: "teal",
        addedAt: new Date().toISOString(),
        events: [],
      };
      return {
        friends: [...s.friends, newFriend],
        pendingRequests: s.pendingRequests.filter((r) => r.id !== requestId),
      };
    }),

  declineRequest: (requestId) =>
    set((s) => ({
      pendingRequests: s.pendingRequests.filter((r) => r.id !== requestId),
    })),
}));
