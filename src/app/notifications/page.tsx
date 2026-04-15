"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  useNotificationStore,
  type Notification,
} from "@/lib/notificationStore";
import type { NotificationType } from "@/lib/notificationTypes";
import { useSettingsStore } from "@/lib/settingsStore";
import { useAuthStore } from "@/lib/authStore";

interface NotiT {
  title: string;
  markAllRead: string;
  unreadCount: (n: number) => string;
  noNew: string;
  filterAll: string;
  filterUnread: string;
  today: string;
  yesterday: string;
  older: string;
  empty: string;
  emptyDesc: string;
  accept: string;
  decline: string;
  justNow: string;
  minutesAgo: (m: number) => string;
  hoursAgo: (h: number) => string;
  daysAgo: (d: number) => string;
  guestTitle: string;
  guestDesc: string;
  login: string;
  signup: string;
  bodyTemplates: Partial<
    Record<NotificationType, (meta: Record<string, string>) => string>
  >;
}

function getBody(notification: Notification, t: NotiT): string {
  if (!notification.meta || !notification.type) return notification.body;
  const template = t.bodyTemplates[notification.type as keyof typeof t.bodyTemplates];
  return template ? template(notification.meta as Record<string, string>) : notification.body;
}

const T: Record<string, NotiT> = {
  ko: {
    title: "알림",
    markAllRead: "모두 읽음 처리",
    unreadCount: (n: number) => `읽지 않은 알림 ${n}개`,
    noNew: "새 알림이 없어요",
    filterAll: "전체",
    filterUnread: "읽지 않음",
    today: "오늘",
    yesterday: "어제",
    older: "이전",
    empty: "알림이 없어요",
    emptyDesc: "새로운 소식이 생기면 여기에 표시됩니다.",
    accept: "수락",
    decline: "거절",
    justNow: "방금 전",
    minutesAgo: (m: number) => `${m}분 전`,
    hoursAgo: (h: number) => `${h}시간 전`,
    daysAgo: (d: number) => (d === 1 ? "어제" : `${d}일 전`),
    guestTitle: "알림 기능은 회원가입 후 이용할 수 있어요",
    guestDesc: "친구 요청과 일정 업데이트를 바로 받아보세요.",
    login: "로그인",
    signup: "회원가입",
    bodyTemplates: {
      friend_request: (m) => `${m.fromName ?? "누군가"}님이 친구 요청을 보냈어요.`,
      meeting_confirmed: (m) =>
        m.fromName
          ? `${m.fromName}님이 친구 요청을 수락했어요.`
          : "친구 요청이 수락되었어요.",
      room_invite: (m) => `${m.roomName ?? "방"}에 초대되었어요.`,
      member_joined: (m) => `${m.fromName ?? "누군가"}님이 ${m.roomName ?? "방"}에 참여했어요.`,
      schedule_conflict: (m) => `${m.roomName ?? "일정"}에서 시간 충돌이 감지되었어요.`,
    },
  },
  en: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    unreadCount: (n: number) => `${n} unread`,
    noNew: "No new notifications",
    filterAll: "All",
    filterUnread: "Unread",
    today: "Today",
    yesterday: "Yesterday",
    older: "Earlier",
    empty: "No notifications",
    emptyDesc: "New updates will appear here.",
    accept: "Accept",
    decline: "Decline",
    justNow: "Just now",
    minutesAgo: (m: number) => `${m}m ago`,
    hoursAgo: (h: number) => `${h}h ago`,
    daysAgo: (d: number) => (d === 1 ? "Yesterday" : `${d}d ago`),
    guestTitle: "Notification features are available after sign up",
    guestDesc: "Receive friend requests and schedule updates in one place.",
    login: "Log in",
    signup: "Sign Up",
    bodyTemplates: {
      friend_request: (m) => `${m.fromName ?? "Someone"} sent you a friend request.`,
      friend_accepted: (m) =>
        m.fromName
          ? `${m.fromName} accepted your friend request.`
          : "Your friend request was accepted.",
      meeting_confirmed: (m) =>
        m.fromName
          ? `${m.fromName} accepted your friend request.`
          : "Your friend request was accepted.",
      room_invite: (m) => `You were invited to ${m.roomName ?? "a room"}.`,
      member_joined: (m) => `${m.fromName ?? "Someone"} joined ${m.roomName ?? "a room"}.`,
      schedule_conflict: (m) =>
        `A scheduling conflict was detected in ${m.roomName ?? "your schedule"}.`,
    },
  },
};

function relativeTime(iso: string, t: NotiT): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  return t.daysAgo(days);
}

function dateGroupKey(iso: string): "today" | "yesterday" | "older" {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = diff / 3600000;
  if (hours < 24) return "today";
  if (hours < 48) return "yesterday";
  return "older";
}

const TYPE_CONFIG: Record<NotificationType, { icon: ReactNode; bg: string; color: string }> = {
  friend_request: {
    bg: "#ede9fe",
    color: "#6d28d9",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  friend_accepted: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  room_invite: {
    bg: "#dbeafe",
    color: "#1d4ed8",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  meeting_confirmed: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="9 16 11 18 15 14" />
      </svg>
    ),
  },
  member_joined: {
    bg: "#ccfbf1",
    color: "#0f766e",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  schedule_conflict: {
    bg: "#ffedd5",
    color: "#c2410c",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

function NotificationItem({
  notification,
  t,
  onRead,
  onDismiss,
  onAccept,
  onDecline,
}: {
  notification: Notification;
  t: NotiT;
  onRead: () => void;
  onDismiss: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const config = TYPE_CONFIG[notification.type];

  return (
    <div
      onClick={onRead}
      className={`relative flex cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-surface-container-low sm:gap-4 sm:px-5 ${
        !notification.read ? "bg-primary-fixed/30" : ""
      }`}
    >
      {!notification.read ? (
        <span className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      ) : null}
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className={`text-sm leading-snug ${notification.read ? "text-on-surface" : "font-semibold text-on-surface"}`}>
            {getBody(notification, t)}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="whitespace-nowrap text-[10px] text-on-surface-variant">
              {relativeTime(notification.time, t)}
            </span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onDismiss();
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-on-surface-variant transition-opacity hover:bg-surface-container-high"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {notification.actionable ? (
          <div className="mt-2.5 flex gap-2" onClick={(event) => event.stopPropagation()}>
            <button onClick={onAccept} className="btn-gradient rounded-full px-3 py-1.5 text-xs font-bold text-on-primary">
              {t.accept}
            </button>
            <button
              onClick={onDecline}
              className="rounded-full border border-outline-variant/30 px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              {t.decline}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type Filter = "all" | "unread";

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, dismiss } = useNotificationStore();
  const { language } = useSettingsStore();
  const { isGuest } = useAuthStore();
  const t = T[language];

  const [filter, setFilter] = useState<Filter>("all");

  if (isGuest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.guestTitle}
        </h3>
        <p className="max-w-xs text-sm text-on-surface-variant">{t.guestDesc}</p>
        <div className="mt-2 flex gap-2">
          <a
            href="/login"
            className="rounded-full border border-outline-variant/40 px-6 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container"
          >
            {t.login}
          </a>
          <a href="/signup" className="btn-gradient rounded-full px-6 py-2.5 text-sm font-bold text-on-primary">
            {t.signup}
          </a>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const filtered = filter === "unread"
    ? notifications.filter((notification) => !notification.read)
    : notifications;

  const groupKeys: Array<"today" | "yesterday" | "older"> = ["today", "yesterday", "older"];
  const groups = groupKeys
    .map((key) => ({
      label: t[key],
      items: filtered.filter((notification) => dateGroupKey(notification.time) === key),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="glass-nav flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
        {unreadCount > 0 ? (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">
            {t.markAllRead}
          </button>
        ) : null}
      </div>

      <main className="mobile-page-safe flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {unreadCount > 0 ? t.unreadCount(unreadCount) : t.noNew}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {([
            ["all", t.filterAll],
            ["unread", t.filterUnread],
          ] as [Filter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filter === value
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
              {value === "unread" && unreadCount > 0 ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    filter === "unread"
                      ? "bg-white/25 text-white"
                      : "bg-primary text-on-primary"
                  }`}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="mb-1 text-base font-bold text-on-surface">{t.empty}</p>
            <p className="text-sm text-on-surface-variant">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map(({ label, items }) => (
              <div key={label}>
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                  {label}
                </p>
                <div className="group overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
                  {items.map((notification, index) => (
                    <div key={notification.id} className={index > 0 ? "border-t border-outline-variant/10" : ""}>
                      <NotificationItem
                        notification={notification}
                        t={t}
                        onRead={() => markRead(notification.id)}
                        onDismiss={() => dismiss(notification.id)}
                        onAccept={() => markRead(notification.id)}
                        onDecline={() => dismiss(notification.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
