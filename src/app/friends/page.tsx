"use client";

import { useState } from "react";
import { useFriendStore } from "@/lib/friendStore";
import { getMemberStyle } from "@/types/room";

function generateFriendInviteLink() {
  const token = btoa("friend:invite:" + Date.now()).replace(/=/g, "").slice(0, 12);
  return `weekedule.app/friends/invite?token=${token}`;
}

export default function FriendsPage() {
  const { friends, pendingRequests, removeFriend, acceptRequest, declineRequest } = useFriendStore();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink] = useState(() => generateFriendInviteLink());

  const handleRemove = (id: string) => {
    if (confirmRemoveId === id) {
      removeFriend(id);
      setConfirmRemoveId(null);
    } else {
      setConfirmRemoveId(id);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Top Bar */}
      <div className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center justify-between shrink-0">
        <h2
          className="text-sm font-bold text-on-surface"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          친구
        </h2>
        <button
          onClick={() => { setShowAddPanel(true); setCopied(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-xs font-bold text-on-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          친구 추가
        </button>
      </div>

      <main className="px-8 py-6 max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-extrabold text-on-surface tracking-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            친구
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">{friends.length}명의 친구</p>
        </div>

        {/* Add friend via link */}
        {showAddPanel && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-on-surface">친구 추가</h3>
              <button
                onClick={() => setShowAddPanel(false)}
                className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">링크를 공유해서 친구를 추가하세요</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-on-surface bg-surface-container rounded-xl px-3 py-2.5 font-mono truncate">
                {inviteLink}
              </code>
              <button
                onClick={handleCopy}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copied ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                }`}
              >
                {copied ? "복사됨 ✓" : "복사"}
              </button>
            </div>
          </div>
        )}

        {/* Pending requests */}
        {pendingRequests.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-2">
              받은 요청
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold leading-none">
                {pendingRequests.length}
              </span>
            </h3>
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {pendingRequests.map((req, i) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? "border-t border-outline-variant/10" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
                    {req.fromInitials[0]}
                  </div>
                  <p className="flex-1 text-sm font-semibold text-on-surface">{req.fromName}</p>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="px-3 py-1.5 rounded-full btn-gradient text-xs font-bold text-on-primary"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => declineRequest(req.id)}
                      className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
            친구 목록 — {friends.length}명
          </h3>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-base font-bold text-on-surface mb-1">친구가 없어요</p>
              <p className="text-sm text-on-surface-variant mb-4">링크를 공유해서 친구를 추가해보세요</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="px-4 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary"
              >
                친구 추가하기
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {friends.map((friend, i) => {
                const memberStyle = getMemberStyle(friend.colorId);
                const isConfirmRemove = confirmRemoveId === friend.id;
                return (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 px-5 py-3.5 group hover:bg-surface-container-low transition-colors ${
                      i > 0 ? "border-t border-outline-variant/10" : ""
                    }`}
                  >
                    <div
                      style={memberStyle}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    >
                      {friend.initials[0]}
                    </div>
                    <p className="flex-1 text-sm font-semibold text-on-surface">{friend.name}</p>
                    <button
                      onClick={() => handleRemove(friend.id)}
                      onBlur={() => setTimeout(() => setConfirmRemoveId(null), 200)}
                      className={`opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        isConfirmRemove
                          ? "opacity-100 bg-error text-on-error"
                          : "text-on-surface-variant hover:text-error hover:bg-error/5 border border-outline-variant/20"
                      }`}
                    >
                      {isConfirmRemove ? "정말 삭제?" : "삭제"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
