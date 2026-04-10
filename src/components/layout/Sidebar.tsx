"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFriendStore } from "@/lib/friendStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { useAuthStore } from "@/lib/authStore";

const NAV_LABELS = {
  ko: { "/": "시간표", "/rooms": "Rooms", "/friends": "친구", "/notifications": "알림", "/settings": "설정" },
  en: { "/": "Timetable", "/rooms": "Rooms", "/friends": "Friends", "/notifications": "Notifications", "/settings": "Settings" },
} as const;

const NAV_ICONS: Record<string, React.ReactNode> = {
  "/": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" />
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
};

const NAV_HREFS = ["/", "/rooms", "/friends", "/notifications", "/settings"] as const;
type NavHref = typeof NAV_HREFS[number];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { pendingRequests } = useFriendStore();
  const { notifications } = useNotificationStore();
  const { language } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const displayName = user?.name ?? "Guest";

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const labels = NAV_LABELS[language];

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function getBadge(href: NavHref) {
    if (href === "/notifications" && unreadNotifCount > 0) return unreadNotifCount;
    if (href === "/friends" && pendingRequests.length > 0) return pendingRequests.length;
    return null;
  }

  return (
    <aside className="w-56 min-w-56 flex flex-col bg-surface-container-low h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <h1
          className="text-lg font-extrabold tracking-tight text-primary leading-none"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Weekedule
        </h1>
        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium tracking-wide uppercase">
          Orchestrated Flow
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV_HREFS.map((href) => {
          const isActive = pathname === href;
          const badge = getBadge(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-surface-container-lowest text-primary shadow-ambient"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
              <span className={isActive ? "text-primary" : ""}>{NAV_ICONS[href]}</span>
              <span>{labels[href]}</span>
              {badge !== null && (
                <span className="ml-auto text-[10px] bg-primary text-on-primary rounded-full px-1.5 py-0.5 font-semibold leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 pt-3 flex flex-col gap-1">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-surface-container rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate leading-tight">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
