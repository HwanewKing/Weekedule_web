"use client";

import { create } from "zustand";
import { Room, RoomColor, RoomIcon } from "@/types/room";

interface RoomStore {
  rooms: Room[];
  fetchRooms: () => Promise<void>;
  addRoom: (data: { name: string; description: string; color: RoomColor; icon: RoomIcon }) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addMember: (roomId: string, userId: string) => Promise<{ error?: string }>;
  removeMember: (roomId: string, memberId: string) => Promise<void>;
  updateMemberColor: (roomId: string, memberId: string, colorId: string) => Promise<void>;
}

// API 응답 → Room 타입 변환
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRoom(r: any): Room {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    color: r.color,
    icon: r.icon,
    heatmapColor: r.heatmapColor ?? "blue",
    nextSync: r.nextSync,
    nextSyncDay: r.nextSyncDay,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
    members: (r.members ?? []).map((m: any) => ({
      id: m.id,
      name: m.user?.name ?? "",
      initials: (m.user?.name ?? "").slice(0, 2),
      colorId: m.colorId ?? "blue",
      events: (m.events ?? []).map((e: any) => e.event),
    })),
  };
}

export const useRoomStore = create<RoomStore>()((set, get) => ({
  rooms: [],

  fetchRooms: async () => {
    const res = await fetch("/api/rooms");
    if (!res.ok) return;
    const data = await res.json();
    set({ rooms: (data.rooms ?? []).map(mapRoom) });
  },

  addRoom: async ({ name, description, color, icon }) => {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color, icon }),
    });
    if (res.ok) {
      const data = await res.json();
      set((s) => ({ rooms: [mapRoom(data.room), ...s.rooms] }));
    }
  },

  updateRoom: async (id, updates) => {
    const prev = get().rooms;
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) set({ rooms: prev });
    } catch {
      set({ rooms: prev });
    }
  },

  deleteRoom: async (id) => {
    const prev = get().rooms;
    set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) }));
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
      if (!res.ok) set({ rooms: prev });
    } catch {
      set({ rooms: prev });
    }
  },

  addMember: async (roomId, userId) => {
    const res = await fetch(`/api/rooms/${roomId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    await get().fetchRooms();
    return {};
  },

  removeMember: async (roomId, memberId) => {
    const prev = get().rooms;
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, members: r.members.filter((m) => m.id !== memberId) }
          : r
      ),
    }));
    try {
      const res = await fetch(`/api/rooms/${roomId}/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) set({ rooms: prev });
    } catch {
      set({ rooms: prev });
    }
  },

  updateMemberColor: async (roomId, memberId, colorId) => {
    const prev = get().rooms;
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, members: r.members.map((m) => (m.id === memberId ? { ...m, colorId } : m)) }
          : r
      ),
    }));
    try {
      const res = await fetch(`/api/rooms/${roomId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colorId }),
      });
      if (!res.ok) set({ rooms: prev });
    } catch {
      set({ rooms: prev });
    }
  },
}));
