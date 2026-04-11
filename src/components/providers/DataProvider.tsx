"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useWeekedualeStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { useFriendStore } from "@/lib/friendStore";
import { useNotificationStore } from "@/lib/notificationStore";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";

/**
 * 로그인 상태가 확인되면 모든 데이터를 서버에서 한 번에 불러옵니다.
 * AuthGuard 내부, 인증된 레이아웃 영역에서만 렌더링됩니다.
 */
export default function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { fetchEvents } = useWeekedualeStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchFriends } = useFriendStore();
  const { fetchNotifications } = useNotificationStore();
  const { fetchRooms } = useRoomStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!user) return;
    fetchEvents();
    fetchCategories();
    fetchFriends();
    fetchNotifications();
    fetchRooms();
    fetchSettings();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
