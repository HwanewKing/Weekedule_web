"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Room, RoomMember, RoomColor, RoomIcon } from "@/types/room";

interface RoomStore {
  rooms: Room[];
  addRoom: (data: { name: string; description: string; color: RoomColor; icon: RoomIcon }) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addMember: (roomId: string, member: Omit<RoomMember, "events"> & { events?: RoomMember["events"] }) => void;
  removeMember: (roomId: string, memberId: string) => void;
  updateMemberColor: (roomId: string, memberId: string, colorId: string) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      rooms: [],

      addRoom: ({ name, description, color, icon }) =>
        set((s) => ({
          rooms: [
            ...s.rooms,
            {
              id: crypto.randomUUID(),
              name,
              description,
              color,
              icon,
              heatmapColor: "blue",
              members: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateRoom: (id, updates) =>
        set((s) => ({
          rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRoom: (id) =>
        set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

      addMember: (roomId, member) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, members: [...r.members, { ...member, events: member.events ?? [] }] }
              : r
          ),
        })),

      removeMember: (roomId, memberId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? { ...r, members: r.members.filter((m) => m.id !== memberId) }
              : r
          ),
        })),

      updateMemberColor: (roomId, memberId, colorId) =>
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  members: r.members.map((m) =>
                    m.id === memberId ? { ...m, colorId } : m
                  ),
                }
              : r
          ),
        })),
    }),
    { name: "weekedule-rooms" }
  )
);
