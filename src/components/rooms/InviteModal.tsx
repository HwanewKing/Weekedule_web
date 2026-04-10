"use client";

import { useState } from "react";
import { useFriendStore } from "@/lib/friendStore";
import { useRoomStore } from "@/lib/roomStore";
import { getMemberStyle, colorIdxToId } from "@/types/room";

type InviteTab = "link" | "friend";

interface Props {
  roomId: string;
  onClose: () => void;
}

function generateInviteLink(roomId: string) {
  const token = btoa(roomId + ":invite:" + Date.now()).replace(/=/g, "").slice(0, 12);
  return `weekedule.app/invite/${roomId}?token=${token}`;
}

export default function InviteModal({ roomId, onClose }: Props) {
  const [tab, setTab] = useState<InviteTab>("link");
  const [copied, setCopied] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [inviteLink] = useState(() => generateInviteLink(roomId));

  const { friends } = useFriendStore();
  const { rooms, addMember } = useRoomStore();

  const room = rooms.find((r) => r.id === roomId);
  const existingMemberNames = new Set(room?.members.map((m) => m.name) ?? []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend || !room) return;
    addMember(roomId, {
      id: friend.id,
      name: friend.name,
      initials: friend.initials,
      colorId: colorIdxToId(room.members.length),
      events: friend.events,
    });
    setAddedIds((prev) => new Set(prev).add(friendId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-surface-container-lowest rounded-3xl shadow-ambient border border-outline-variant/10 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2
              className="text-lg font-extrabold text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              멤버 초대하기
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              링크를 공유하거나 친구를 직접 초대하세요
            </p>
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
          {([["link", "링크로 초대"], ["friend", "친구 초대"]] as [InviteTab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 pb-6">
          {tab === "link" && (
            <div className="flex flex-col gap-3">
              <div className="bg-surface-container rounded-2xl p-4">
                <p className="text-xs text-on-surface-variant mb-2 font-medium">초대 링크</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-on-surface bg-surface-container-high rounded-xl px-3 py-2 font-mono truncate">
                    {inviteLink}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      copied
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "btn-gradient text-on-primary"
                    }`}
                  >
                    {copied ? "복사됨 ✓" : "복사"}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant text-center">
                링크를 통해 가입한 사람은 이 룸에 자동으로 참여돼요
              </p>
            </div>
          )}

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
                    const isAlreadyMember = existingMemberNames.has(friend.name);
                    const isAdded = addedIds.has(friend.id);
                    const memberStyle = getMemberStyle(friend.colorId);
                    return (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-surface-container transition-colors"
                      >
                        <div
                          style={memberStyle}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        >
                          {friend.initials[0]}
                        </div>
                        <p className="flex-1 text-sm font-semibold text-on-surface">{friend.name}</p>
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
                              onClick={() => handleInviteFriend(friend.id)}
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
        </div>
      </div>
    </div>
  );
}
