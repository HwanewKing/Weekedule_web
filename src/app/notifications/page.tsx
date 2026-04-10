"use client";

import { useState } from "react";
import { useNotificationStore, Notification, NotificationType } from "@/lib/notificationStore";

// ── 상대 시간 포맷 ───────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d === 1) return "어제";
  return `${d}일 전`;
}

// 날짜 그룹 레이블
function dateGroup(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = diff / 3600000;
  if (h < 24)  return "오늘";
  if (h < 48)  return "어제";
  return "이전";
}

// ── 알림 타입별 아이콘 & 색상 ────────────────────────────────────
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  friend_request: {
    bg: "#ede9fe",
    color: "#6d28d9",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
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
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
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

// ── 개별 알림 카드 ────────────────────────────────────────────────
function NotificationItem({ n, onRead, onDismiss, onAccept, onDecline }: {
  n: Notification;
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
      {/* 읽지 않음 도트 */}
      {!n.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* 아이콘 */}
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        {cfg.icon}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${n.read ? "text-on-surface" : "font-semibold text-on-surface"}`}>
            {n.body}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
              {relativeTime(n.time)}
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

        {/* 액션 버튼 */}
        {n.actionable && (
          <div className="flex gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onAccept}
              className="px-3 py-1.5 rounded-full btn-gradient text-xs font-bold text-on-primary"
            >
              수락
            </button>
            <button
              onClick={onDecline}
              className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              거절
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
type Filter = "all" | "unread";

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, dismiss, acceptAction, declineAction } =
    useNotificationStore();
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  // 날짜 그룹으로 묶기
  const groups: { label: string; items: Notification[] }[] = [];
  const ORDER = ["오늘", "어제", "이전"];
  for (const label of ORDER) {
    const items = filtered.filter((n) => dateGroup(n.time) === label);
    if (items.length > 0) groups.push({ label, items });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Top Bar */}
      <div className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center justify-between shrink-0">
        <h2
          className="text-sm font-bold text-on-surface"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          알림
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-primary hover:underline"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      <main className="px-8 py-6 max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-3xl font-extrabold text-on-surface tracking-tight"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              알림
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "새 알림이 없어요"}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {([["all", "전체"], ["unread", "읽지 않음"]] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
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

        {/* 알림 목록 */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-base font-bold text-on-surface mb-1">알림이 없어요</p>
            <p className="text-sm text-on-surface-variant">새로운 소식이 생기면 여기에 표시돼요</p>
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
                        onRead={() => markRead(n.id)}
                        onDismiss={() => dismiss(n.id)}
                        onAccept={() => acceptAction(n.id)}
                        onDecline={() => declineAction(n.id)}
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
