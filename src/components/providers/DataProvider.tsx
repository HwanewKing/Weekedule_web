"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useWeekedualeStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { useFriendStore } from "@/lib/friendStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { CalendarEvent } from "@/types/event";

/**
 * 로그인 상태가 확인되면 모든 데이터를 서버에서 한 번에 불러옵니다.
 * AuthGuard 내부, 인증된 레이아웃 영역에서만 렌더링됩니다.
 */
export default function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuthStore();
  const { fetchEvents, setEvents } = useWeekedualeStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchFriends } = useFriendStore();
  const { fetchNotifications } = useNotificationStore();
  const { fetchRooms } = useRoomStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (isGuest) {
      // 게스트: localStorage에서 이벤트만 로드, 나머지 API 스킵
      try {
        const raw = localStorage.getItem("weekedule-guest-events");
        const saved: CalendarEvent[] = raw ? JSON.parse(raw) : [];
        setEvents(saved);
      } catch {
        setEvents([]);
      }
      return;
    }
    if (!user) return;
    fetchEvents();
    fetchCategories();
    fetchFriends();
    fetchNotifications();
    fetchRooms();
    fetchSettings();
  }, [user?.id, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
