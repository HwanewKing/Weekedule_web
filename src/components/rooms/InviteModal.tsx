"use client";

import { useState } from "react";
import { useFriendStore } from "@/lib/friendStore";
import { useAuthStore } from "@/lib/authStore";
import { useRoomStore } from "@/lib/roomStore";
import { getMemberStyle } from "@/types/room";

type InviteTab = "link" | "friend";

interface Props {
  roomId: string;
  onClose: () => void;
}

export default function InviteModal({ roomId, onClose }: Props) {
  const [tab, setTab] = useState<InviteTab>("friend");
  const [copied, setCopied] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  const { user } = useAuthStore();
  const { friends } = useFriendStore();
  const { rooms, addMember } = useRoomStore();

  const room = rooms.find((r) => r.id === roomId);
  const existingMemberUserIds = new Set(room?.members.map((m) => m.id) ?? []);

  const generateLink = async () => {
    if (inviteLink) return;
    setLinkLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (data.token) {
        setInviteLink(`${window.location.origin}/invite/${data.token}`);
      }
    } finally {
      setLinkLoading(false);
    }
  };

  const handleTabChange = (t: InviteTab) => {
    setTab(t);
    if (t === "link") generateLink();
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try { await navigator.clipboard.writeText(inviteLink); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = async (friendUserId: string) => {
    if (!room || !user) return;
    const result = await addMember(roomId, friendUserId);
    if (!result.error) {
      setAddedIds((prev) => new Set(prev).add(friendUserId));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 bg-surface-container-lowest rounded-3xl shadow-ambient border border-outline-variant/10 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              멤버 초대하기
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">친구를 초대하거나 링크를 공유하세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-1 mb-4">
          {([["friend", "친구 초대"], ["link", "링크로 초대"]] as [InviteTab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === t ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {tab === "friend" && (
            <div className="flex flex-col gap-2">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-on-surface-variant">아직 친구가 없어요</p>
                  <p className="text-xs text-on-surface-variant mt-1">친구 탭에서 먼저 친구를 추가해보세요!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1">
                  {friends.map((friend) => {
                    const isAlreadyMember = existingMemberUserIds.has(friend.userId);
                    const isAdded = addedIds.has(friend.userId);
                    const memberStyle = getMemberStyle(friend.colorId);
                    return (
                      <div
                        key={friend.userId}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-surface-container transition-colors"
                      >
                        <div
                          style={memberStyle}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          {friend.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface">{friend.name}</p>
                          <p className="text-[11px] text-on-surface-variant">{friend.email}</p>
                        </div>
                        <div className="shrink-0">
                          {isAlreadyMember ? (
                            <span className="text-[10px] text-on-surface-variant px-2.5 py-1 bg-surface-container rounded-full">
                              이미 참여 중
                            </span>
                          ) : isAdded ? (
                            <span className="text-[10px] text-[#16a34a] px-2.5 py-1 bg-[#dcfce7] rounded-full font-semibold">
                              추가됨 ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInviteFriend(friend.userId)}
                              className="px-3 py-1.5 rounded-full btn-gradient text-xs font-bold text-on-primary"
                            >
                              초대
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "link" && (
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container rounded-2xl p-4">
                <p className="text-xs text-on-surface-variant mb-2 font-medium">초대 링크 (7일 유효)</p>
                {linkLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span className="text-xs text-on-surface-variant">링크 생성 중...</span>
                  </div>
                ) : inviteLink ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-on-surface bg-surface-container-high rounded-xl px-3 py-2 font-mono truncate">
                      {inviteLink}
                    </code>
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        copied ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                      }`}
                    >
                      {copied ? "복사됨 ✓" : "복사"}
                    </button>
                  </div>
                ) : (
                  <button onClick={generateLink} className="text-xs text-primary font-semibold hover:underline">
                    링크 생성하기
                  </button>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant text-center">
                링크를 통해 참여한 사람은 이 룸에 자동으로 추가돼요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
