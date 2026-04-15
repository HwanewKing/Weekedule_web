"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoomColor, RoomIcon } from "@/types/room";

export interface RoomPreference {
  icon?: RoomIcon;
  color?: RoomColor;
  memo?: string;
}

interface RoomPreferencesState {
  byUser: Record<string, Record<string, RoomPreference>>;
  getRoomPreference: (userId: string | undefined, roomId: string) => RoomPreference | undefined;
  setRoomPreference: (
    userId: string | undefined,
    roomId: string,
    updates: RoomPreference
  ) => void;
}

export const useRoomPreferencesStore = create<RoomPreferencesState>()(
  persist(
    (set, get) => ({
      byUser: {},

      getRoomPreference: (userId, roomId) => {
        if (!userId) return undefined;
        return get().byUser[userId]?.[roomId];
      },

      setRoomPreference: (userId, roomId, updates) => {
        if (!userId) return;

        set((state) => ({
          byUser: {
            ...state.byUser,
            [userId]: {
              ...(state.byUser[userId] ?? {}),
              [roomId]: {
                ...(state.byUser[userId]?.[roomId] ?? {}),
                ...updates,
              },
            },
          },
        }));
      },
    }),
    {
      name: "weekedule-room-preferences",
    }
  )
);
