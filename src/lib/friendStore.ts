"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FriendRelation, Friend } from "@/types/friend";
import { useAuthStore } from "@/lib/authStore";
import { MEMBER_COLOR_OPTIONS, colorIdxToId } from "@/types/room";

interface FriendStore {
  relations: FriendRelation[];

  /** 이메일로 친구 요청 보내기 */
  sendRequest: (
    fromUserId: string,
    fromName: string,
    fromEmail: string,
    toEmail: string
  ) => { success: boolean; error?: string };

  /** 받은 요청 수락 */
  acceptRequest: (relationId: string) => void;

  /** 받은 요청 거절 (관계 삭제) */
  declineRequest: (relationId: string) => void;

  /** 친구 삭제 */
  removeFriend: (myId: string, otherUserId: string) => void;
}

export const useFriendStore = create<FriendStore>()(
  persist(
    (set, get) => ({
      relations: [],

      sendRequest: (fromUserId, fromName, fromEmail, toEmail) => {
        const trimmed = toEmail.trim().toLowerCase();

        // 자기 자신에게 요청 불가
        if (fromEmail.toLowerCase() === trimmed) {
          return { success: false, error: "자신에게 친구 요청을 보낼 수 없어요" };
        }

        // authStore에서 이메일로 유저 찾기 (백엔드 없이 클라이언트에서 처리)
        const { users } = useAuthStore.getState();
        const toUser = users.find((u) => u.email.toLowerCase() === trimmed);

        if (!toUser) {
          return { success: false, error: "해당 이메일로 가입된 계정이 없어요" };
        }
        if (!toUser.verified) {
          return { success: false, error: "이메일 인증이 완료되지 않은 계정이에요" };
        }

        // 기존 관계 확인
        const existing = get().relations.find(
          (r) =>
            (r.requesterId === fromUserId && r.addresseeId === toUser.id) ||
            (r.requesterId === toUser.id && r.addresseeId === fromUserId)
        );

        if (existing) {
          if (existing.status === "accepted") {
            return { success: false, error: "이미 친구 관계예요" };
          }
          if (existing.status === "pending") {
            return { success: false, error: "이미 요청을 보냈거나 받은 상태예요" };
          }
        }

        set((s) => ({
          relations: [
            ...s.relations,
            {
              id: crypto.randomUUID(),
              requesterId: fromUserId,
              requesterName: fromName,
              requesterEmail: fromEmail,
              addresseeId: toUser.id,
              addresseeName: toUser.name,
              addresseeEmail: toUser.email,
              status: "pending",
              createdAt: new Date().toISOString(),
            },
          ],
        }));

        return { success: true };
      },

      acceptRequest: (relationId) =>
        set((s) => ({
          relations: s.relations.map((r) =>
            r.id === relationId ? { ...r, status: "accepted" } : r
          ),
        })),

      declineRequest: (relationId) =>
        set((s) => ({
          relations: s.relations.filter((r) => r.id !== relationId),
        })),

      removeFriend: (myId, otherUserId) =>
        set((s) => ({
          relations: s.relations.filter(
            (r) =>
              !(
                (r.requesterId === myId && r.addresseeId === otherUserId) ||
                (r.requesterId === otherUserId && r.addresseeId === myId)
              )
          ),
        })),
    }),
    { name: "weekedule-friends" }
  )
);

// ── 파생 헬퍼 (컴포넌트에서 사용) ─────────────────────────────

/** 현재 유저의 수락된 친구 목록 */
export function getFriends(relations: FriendRelation[], myId: string): Friend[] {
  return relations
    .filter(
      (r) =>
        r.status === "accepted" &&
        (r.requesterId === myId || r.addresseeId === myId)
    )
    .map((r, idx) => {
      const isRequester = r.requesterId === myId;
      return {
        userId: isRequester ? r.addresseeId : r.requesterId,
        name: isRequester ? r.addresseeName : r.requesterName,
        email: isRequester ? r.addresseeEmail : r.requesterEmail,
        initials: makeInitials(isRequester ? r.addresseeName : r.requesterName),
        colorId: colorIdxToId(idx),
        addedAt: r.createdAt,
      };
    });
}

/** 현재 유저가 받은 대기 중인 요청 */
export function getPendingReceived(
  relations: FriendRelation[],
  myId: string
): FriendRelation[] {
  return relations.filter(
    (r) => r.status === "pending" && r.addresseeId === myId
  );
}

/** 현재 유저가 보낸 대기 중인 요청 */
export function getPendingSent(
  relations: FriendRelation[],
  myId: string
): FriendRelation[] {
  return relations.filter(
    (r) => r.status === "pending" && r.requesterId === myId
  );
}

function makeInitials(name: string): string {
  return name.slice(0, 2);
}

// MEMBER_COLOR_OPTIONS 재export (InviteModal 등에서 사용)
export { MEMBER_COLOR_OPTIONS };
