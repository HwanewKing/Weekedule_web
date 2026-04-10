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
  actionable?: boolean; // 수락/거절 버튼 표시 여부
  meta?: {
    roomId?: string;
    roomName?: string;
    fromName?: string;
  };
}

function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

const SEED: Notification[] = [
  {
    id: "n1",
    type: "room_invite",
    title: "룸 초대",
    body: "김지수님이 'Team Project A'에 초대했어요",
    time: ago(5),
    read: false,
    actionable: true,
    meta: { roomId: "r1", roomName: "Team Project A", fromName: "김지수" },
  },
  {
    id: "n2",
    type: "friend_request",
    title: "친구 요청",
    body: "박민재님이 친구 요청을 보냈어요",
    time: ago(22),
    read: false,
    actionable: true,
    meta: { fromName: "박민재" },
  },
  {
    id: "n3",
    type: "meeting_confirmed",
    title: "미팅 확정",
    body: "'Design Critique' 룸에서 금요일 14:00 미팅이 확정됐어요",
    time: ago(60),
    read: false,
    meta: { roomId: "r4", roomName: "Design Critique" },
  },
  {
    id: "n4",
    type: "member_joined",
    title: "새 멤버 참여",
    body: "이수빈님이 'Research Hub'에 참여했어요",
    time: ago(60 * 3),
    read: false,
    meta: { roomId: "r3", roomName: "Research Hub", fromName: "이수빈" },
  },
  {
    id: "n5",
    type: "schedule_conflict",
    title: "일정 충돌 감지",
    body: "'Club Managers' 룸에서 화요일 9:00–11:00 구간이 모든 멤버와 겹쳐요",
    time: ago(60 * 5),
    read: true,
    meta: { roomId: "r2", roomName: "Club Managers" },
  },
  {
    id: "n6",
    type: "meeting_confirmed",
    title: "미팅 확정",
    body: "'Club Managers' 룸에서 수요일 15:00 미팅이 확정됐어요",
    time: ago(60 * 26),
    read: true,
    meta: { roomId: "r2", roomName: "Club Managers" },
  },
  {
    id: "n7",
    type: "member_joined",
    title: "새 멤버 참여",
    body: "최도현님이 'Team Project A'에 참여했어요",
    time: ago(60 * 48),
    read: true,
    meta: { roomId: "r1", roomName: "Team Project A", fromName: "최도현" },
  },
  {
    id: "n8",
    type: "schedule_conflict",
    title: "일정 충돌 감지",
    body: "'Team Project A' 룸에서 목요일 10:00–12:00 구간이 3명과 겹쳐요",
    time: ago(60 * 50),
    read: true,
    meta: { roomId: "r1", roomName: "Team Project A" },
  },
];

interface NotificationStore {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  acceptAction: (id: string) => void;
  declineAction: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: SEED,

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
        n.id === id ? { ...n, read: true, actionable: false, body: n.body.replace("보냈어요", "수락했어요").replace("초대했어요", "참여했어요") } : n
      ),
    })),

  declineAction: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));
