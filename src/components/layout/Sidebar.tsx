"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useFriendStore } from "@/lib/friendStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useSettingsStore } from "@/lib/settingsStore";

const NAV_LABELS = {
  ko: {
    "/home": "시간표",
    "/rooms": "방",
    "/friends": "친구",
    "/notifications": "알림",
    "/settings": "설정",
    "/feedback": "문의하기",
  },
  en: {
    "/home": "Timetable",
    "/rooms": "Rooms",
    "/friends": "Friends",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/feedback": "Contact",
  },
} as const;

const MOBILE_NAV_HREFS = [
  "/home",
  "/rooms",
  "/friends",
  "/notifications",
  "/settings",
] as const;

const NAV_HREFS = [
  "/home",
  "/rooms",
  "/friends",
  "/notifications",
  "/settings",
  "/feedback",
] as const;

type NavHref = typeof NAV_HREFS[number];
type MobileNavHref = typeof MOBILE_NAV_HREFS[number];

const NAV_ICONS: Record<string, ReactNode> = {
  "/home": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
    </svg>
  ),
  "/rooms": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "/friends": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/notifications": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  "/settings": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  "/feedback": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { pendingIn: pendingRequests } = useFriendStore();
  const { notifications } = useNotificationStore();
  const { language } = useSettingsStore();

  const labels = NAV_LABELS[language];
  const unreadNotifCount = notifications.filter((notification) => !notification.read).length;
  const displayName = user?.name ?? (language === "ko" ? "게스트" : "Guest");
  const logoutLabel = language === "ko" ? "로그아웃" : "Log out";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  function getBadge(href: NavHref) {
    if (href === "/notifications" && unreadNotifCount > 0) return unreadNotifCount;
    if (href === "/friends" && pendingRequests.length > 0) return pendingRequests.length;
    return null;
  }

  return (
    <>
      <aside className="hidden h-full w-56 min-w-56 flex-col bg-surface-container-low md:flex">
        <div className="px-5 pb-5 pt-6">
          <h1
            className="text-lg font-extrabold leading-none tracking-tight text-primary"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Weekedule
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-on-surface-variant">
            Orchestrated Flow
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_HREFS.map((href) => {
            const isActive = pathname === href;
            const badge = getBadge(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-surface-container-lowest text-primary shadow-ambient"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 h-6 w-0.5 rounded-r-full bg-primary" />
                ) : null}
                <span className={isActive ? "text-primary" : ""}>{NAV_ICONS[href]}</span>
                <span>{labels[href]}</span>
                {badge !== null ? (
                  <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-on-primary">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9920827976663604"
            data-ad-slot="TODO_SLOT_ID"
            data-ad-format="vertical"
            data-full-width-responsive="false"
          />
        </div>

        <div className="flex flex-col gap-1 px-3 pb-5 pt-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight text-on-surface">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-on-surface-variant">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {logoutLabel}
          </button>
        </div>
      </aside>

      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-outline-variant/30 bg-surface-container-low md:hidden">
        {MOBILE_NAV_HREFS.map((href) => {
          const isActive = pathname === href;
          const badge = getBadge(href as MobileNavHref);
          const label = labels[href as NavHref];

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {isActive ? (
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-primary" />
              ) : null}
              <span className="relative">
                {NAV_ICONS[href]}
                {badge !== null ? (
                  <span className="absolute -right-2 -top-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold leading-none text-on-primary">
                    {badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
