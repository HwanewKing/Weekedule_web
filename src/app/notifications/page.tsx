"use client";

import { useState } from "react";
import { useNotificationStore, Notification, NotificationType } from "@/lib/notificationStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { useAuthStore } from "@/lib/authStore";

interface NotiT {
  title: string; markAllRead: string; unreadCount: (n: number) => string;
  noNew: string; filterAll: string; filterUnread: string;
  today: string; yesterday: string; older: string;
  empty: string; emptyDesc: string; accept: string; decline: string;
  justNow: string; minutesAgo: (m: number) => string;
  hoursAgo: (h: number) => string; daysAgo: (d: number) => string;
  bodyTemplates: {
    friend_request:    (meta: Record<string, string>) => string;
    meeting_confirmed: (meta: Record<string, string>) => string;
    room_invite:       (meta: Record<string, string>) => string;
    member_joined:     (meta: Record<string, string>) => string;
    schedule_conflict: (meta: Record<string, string>) => string;
  };
}

function getBody(n: Notification, t: NotiT): string {
  if (!n.meta || !n.type) return n.body;
  const tpl = t.bodyTemplates[n.type as keyof typeof t.bodyTemplates];
  return tpl ? tpl(n.meta as Record<string, string>) : n.body;
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
    emptyDesc: "새로운 소식이 생기면 여기에 표시돼요",
    accept: "수락",
    decline: "거절",
    justNow: "방금 전",
    minutesAgo: (m: number) => `${m}분 전`,
    hoursAgo: (h: number) => `${h}시간 전`,
    daysAgo: (d: number) => d === 1 ? "어제" : `${d}일 전`,
    bodyTemplates: {
      friend_request:    (m) => `${m.fromName ?? "누군가"}님이 친구 요청을 보냈어요`,
      meeting_confirmed: (m) => m.fromName ? `${m.fromName}님이 친구 요청을 수락했어요` : "친구 요청이 수락됐어요",
      room_invite:       (m) => `${m.roomName ?? "Room"}에 초대됐어요`,
      member_joined:     (m) => `${m.fromName ?? "누군가"}님이 ${m.roomName ?? "Room"}에 참여했어요`,
      schedule_conflict: (m) => `${m.roomName ?? "일정"}에 시간 충돌이 감지됐어요`,
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
    emptyDesc: "New updates will appear here",
    accept: "Accept",
    decline: "Decline",
    justNow: "Just now",
    minutesAgo: (m: number) => `${m}m ago`,
    hoursAgo: (h: number) => `${h}h ago`,
    daysAgo: (d: number) => d === 1 ? "Yesterday" : `${d}d ago`,
    bodyTemplates: {
      friend_request:    (m) => `${m.fromName ?? "Someone"} sent you a friend request`,
      meeting_confirmed: (m) => m.fromName ? `${m.fromName} accepted your friend request` : "Your friend request was accepted",
      room_invite:       (m) => `You were invited to ${m.roomName ?? "a room"}`,
      member_joined:     (m) => `${m.fromName ?? "Someone"} joined ${m.roomName ?? "a room"}`,
      schedule_conflict: (m) => `A scheduling conflict was detected in ${m.roomName ?? "your schedule"}`,
    },
  },
};

function relativeTime(iso: string, t: NotiT): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return t.justNow;
  if (m < 60) return t.minutesAgo(m);
  const h = Math.floor(m / 60);
  if (h < 24) return t.hoursAgo(h);
  const d = Math.floor(h / 24);
  return t.daysAgo(d);
}

function dateGroupKey(iso: string): "today" | "yesterday" | "older" {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / 3600000;
  if (h < 24) return "today";
  if (h < 48) return "yesterday";
  return "older";
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; bg: string; color: string }> = {
  friend_request: {
    bg: "#ede9fe", color: "#6d28d9",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  room_invite: {
    bg: "#dbeafe", color: "#1d4ed8",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  meeting_confirmed: {
    bg: "#dcfce7", color: "#16a34a",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="9 16 11 18 15 14" />
      </svg>
    ),
  },
  member_joined: {
    bg: "#ccfbf1", color: "#0f766e",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  schedule_conflict: {
    bg: "#ffedd5", color: "#c2410c",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

function NotificationItem({ n, t, onRead, onDismiss, onAccept, onDecline }: {
  n: Notification;
  t: NotiT;
  onRead: () => void;
  onDismiss: () => void;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const cfg = TYPE_CONFIG[n.type];

  return (
    <div
      onClick={onRead}
      className={`relative flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-surface-container-low ${
        !n.read ? "bg-primary-fixed/30" : ""
      }`}
    >
      {!n.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${n.read ? "text-on-surface" : "font-semibold text-on-surface"}`}>
            {getBody(n, t)}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
              {relativeTime(n.time, t)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-opacity"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {n.actionable && (
          <div className="flex gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
            <button onClick={onAccept} className="px-3 py-1.5 rounded-full btn-gradient text-xs font-bold text-on-primary">
              {t.accept}
            </button>
            <button onClick={onDecline} className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
              {t.decline}
            </button>
          </div>
        )}
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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          알림 기능은 회원가입 후 이용할 수 있어요
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs">
          친구 요청, 일정 알림 등을 받아보세요.
        </p>
        <div className="flex gap-2 mt-2">
          <a
            href="/login"
            className="px-6 py-2.5 rounded-full border border-outline-variant/40 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
          >
            로그인
          </a>
          <a
            href="/signup"
            className="px-6 py-2.5 rounded-full btn-gradient text-sm font-bold text-on-primary"
          >
            회원가입
          </a>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const GROUP_KEYS: Array<"today" | "yesterday" | "older"> = ["today", "yesterday", "older"];
  const groups = GROUP_KEYS
    .map((key) => ({ label: t[key], items: filtered.filter((n) => dateGroupKey(n.time) === key) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="glass-nav border-b border-outline-variant/10 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">
            {t.markAllRead}
          </button>
        )}
      </div>

      <main className="px-8 py-6 max-w-2xl flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight" style={{ fontFamily: "var(--font-manrope)" }}>
              {t.title}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {unreadCount > 0 ? t.unreadCount(unreadCount) : t.noNew}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          {([["all", t.filterAll], ["unread", t.filterUnread]] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
              {f === "unread" && unreadCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  filter === "unread" ? "bg-white/25 text-white" : "bg-primary text-on-primary"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-base font-bold text-on-surface mb-1">{t.empty}</p>
            <p className="text-sm text-on-surface-variant">{t.emptyDesc}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map(({ label, items }) => (
              <div key={label}>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2 px-1">
                  {label}
                </p>
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden group">
                  {items.map((n, i) => (
                    <div key={n.id} className={i > 0 ? "border-t border-outline-variant/10" : ""}>
                      <NotificationItem
                        n={n}
                        t={t}
                        onRead={() => markRead(n.id)}
                        onDismiss={() => dismiss(n.id)}
                        onAccept={() => markRead(n.id)}
                        onDecline={() => dismiss(n.id)}
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
