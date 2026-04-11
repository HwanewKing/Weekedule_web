"use client";

import { create } from "zustand";
import { MEMBER_COLOR_OPTIONS, colorIdxToId } from "@/types/room";

export interface Friend {
  userId: string;
  name: string;
  email: string;
  initials: string;
  colorId: string;
}

export interface PendingIn {
  id: string; // relationId
  from: { id: string; name: string; email: string };
}

export interface PendingOut {
  id: string;
  to: { id: string; name: string; email: string };
}

interface FriendStore {
  friends: Friend[];
  pendingIn: PendingIn[];
  pendingOut: PendingOut[];

  fetchFriends: () => Promise<void>;
  sendRequest: (toEmail: string) => Promise<{ success: boolean; error?: string }>;
  acceptRequest: (relationId: string) => Promise<void>;
  declineRequest: (relationId: string) => Promise<void>;
  removeFriend: (relationId: string) => Promise<void>;
}

export const useFriendStore = create<FriendStore>()((set, get) => ({
  friends: [],
  pendingIn: [],
  pendingOut: [],

  fetchFriends: async () => {
    const res = await fetch("/api/friends");
    if (!res.ok) return;
    const data = await res.json();

    const friends: Friend[] = (data.friends ?? []).map(
      (f: { friend: { id: string; name: string; email: string } }, idx: number) => ({
        userId: f.friend.id,
        name: f.friend.name,
        email: f.friend.email,
        initials: f.friend.name.slice(0, 2),
        colorId: colorIdxToId(idx),
      })
    );

    set({
      friends,
      pendingIn: data.pendingIn ?? [],
      pendingOut: data.pendingOut ?? [],
    });
  },

  sendRequest: async (toEmail) => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: toEmail }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    await get().fetchFriends();
    return { success: true };
  },

  acceptRequest: async (relationId) => {
    await fetch(`/api/friends/${relationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    await get().fetchFriends();
  },

  declineRequest: async (relationId) => {
    await fetch(`/api/friends/${relationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    });
    set((s) => ({ pendingIn: s.pendingIn.filter((p) => p.id !== relationId) }));
  },

  removeFriend: async (relationId) => {
    const prev = { friends: get().friends };
    set((s) => ({ friends: s.friends.filter((f) => f.userId !== relationId) }));
    try {
      const res = await fetch(`/api/friends/${relationId}`, { method: "DELETE" });
      if (!res.ok) set(prev);
    } catch {
      set(prev);
    }
  },
}));

// MEMBER_COLOR_OPTIONS 재export (InviteModal 등에서 사용)
export { MEMBER_COLOR_OPTIONS };
