"use client";

import { create } from "zustand";
import { CalendarEvent } from "@/types/event";
import { ConfirmedSlot, Room, RoomColor, RoomIcon } from "@/types/room";

interface RoomStore {
  rooms: Room[];
  confirmedSlots: Record<string, ConfirmedSlot[]>;
  fetchRooms: () => Promise<void>;
  fetchConfirmedSlots: (roomId: string) => Promise<void>;
  addConfirmedSlots: (roomId: string, slots: ConfirmedSlot[]) => void;
  removeConfirmedSlots: (roomId: string, ids: string[]) => void;
  setConfirmedSlots: (roomId: string, slots: ConfirmedSlot[]) => void;
  addRoom: (data: {
    name: string;
    description: string;
    color: RoomColor;
    icon: RoomIcon;
  }) => Promise<void>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  addMember: (roomId: string, userId: string) => Promise<{ error?: string }>;
  removeMember: (roomId: string, memberId: string) => Promise<void>;
  updateMemberColor: (
    roomId: string,
    memberId: string,
    colorId: string
  ) => Promise<void>;
}

type RawRoomEvent = CalendarEvent;

type RawRoomMember = {
  id: string;
  colorId?: string | null;
  user?: {
    name?: string | null;
  } | null;
  events?: Array<{ event?: RawRoomEvent | null } | null> | null;
  personalEvents?: RawRoomEvent[] | null;
};

type RawRoom = {
  id: string;
  name: string;
  description?: string | null;
  color: RoomColor;
  icon: RoomIcon;
  heatmapColor?: string | null;
  nextSync?: string | null;
  nextSyncDay?: string | null;
  createdAt: string | Date;
  members?: RawRoomMember[] | null;
};

type RawConfirmedSlot = Omit<ConfirmedSlot, "createdAt"> & {
  createdAt: string | Date;
};

export function normalizeConfirmedSlot(slot: RawConfirmedSlot): ConfirmedSlot {
  return {
    ...slot,
    createdAt:
      typeof slot.createdAt === "string"
        ? slot.createdAt
        : new Date(slot.createdAt).toISOString(),
  };
}

function mapRoom(room: RawRoom): Room {
  return {
    id: room.id,
    name: room.name,
    description: room.description ?? "",
    color: room.color,
    icon: room.icon,
    heatmapColor: room.heatmapColor ?? "blue",
    nextSync: room.nextSync ?? undefined,
    nextSyncDay: room.nextSyncDay ?? undefined,
    createdAt:
      typeof room.createdAt === "string"
        ? room.createdAt
        : new Date(room.createdAt).toISOString(),
    members: (room.members ?? []).map((member) => {
      const sharedEvents = (member.events ?? [])
        .map((eventRef) => eventRef?.event)
        .filter((event): event is RawRoomEvent => !!event);
      const personalEvents = member.personalEvents ?? [];
      const eventMap = new Map<string, RawRoomEvent>();

      for (const event of [...sharedEvents, ...personalEvents]) {
        if (event.id) {
          eventMap.set(event.id, event);
        }
      }

      const name = member.user?.name ?? "";

      return {
        id: member.id,
        name,
        initials: name.slice(0, 2),
        colorId: member.colorId ?? "blue",
        events: Array.from(eventMap.values()),
      };
    }),
  };
}

export const useRoomStore = create<RoomStore>()((set, get) => ({
  rooms: [],
  confirmedSlots: {},

  fetchConfirmedSlots: async (roomId: string) => {
    const res = await fetch(`/api/rooms/${roomId}/confirm`);
    if (!res.ok) return;

    const data = await res.json();
    const slots: ConfirmedSlot[] = (data.slots ?? []).map(normalizeConfirmedSlot);
    set((state) => ({
      confirmedSlots: { ...state.confirmedSlots, [roomId]: slots },
    }));
  },

  addConfirmedSlots: (roomId: string, slots: ConfirmedSlot[]) => {
    set((state) => ({
      confirmedSlots: {
        ...state.confirmedSlots,
        [roomId]: [...(state.confirmedSlots[roomId] ?? []), ...slots],
      },
    }));
  },

  removeConfirmedSlots: (roomId: string, ids: string[]) => {
    const idSet = new Set(ids);
    set((state) => ({
      confirmedSlots: {
        ...state.confirmedSlots,
        [roomId]: (state.confirmedSlots[roomId] ?? []).filter(
          (slot) => !idSet.has(slot.id)
        ),
      },
    }));
  },

  setConfirmedSlots: (roomId: string, slots: ConfirmedSlot[]) => {
    set((state) => ({
      confirmedSlots: { ...state.confirmedSlots, [roomId]: slots },
    }));
  },

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
      set((state) => ({ rooms: [mapRoom(data.room), ...state.rooms] }));
    }
  },

  updateRoom: async (id, updates) => {
    const prev = get().rooms;
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
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
    set((state) => ({ rooms: state.rooms.filter((room) => room.id !== id) }));

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
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              members: room.members.filter((member) => member.id !== memberId),
            }
          : room
      ),
    }));

    try {
      const res = await fetch(`/api/rooms/${roomId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) set({ rooms: prev });
    } catch {
      set({ rooms: prev });
    }
  },

  updateMemberColor: async (roomId, memberId, colorId) => {
    const prev = get().rooms;
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              members: room.members.map((member) =>
                member.id === memberId ? { ...member, colorId } : member
              ),
            }
          : room
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
