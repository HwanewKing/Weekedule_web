"use client";

import { useState } from "react";
import { useFriendStore } from "@/lib/friendStore";
import { useAuthStore } from "@/lib/authStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { getMemberStyle } from "@/types/room";

const T = {
  ko: {
    title: "친구",
    addFriend: "친구 추가",
    friendCount: (n: number) => `${n}명의 친구`,
    addPanel: "친구 추가",
    emailLabel: "이메일로 찾기",
    emailPlaceholder: "친구의 이메일 주소",
    sendRequest: "요청 보내기",
    sending: "...",
    successMsg: "친구 요청을 보냈어요!",
    or: "또는",
    inviteLabel: "링크로 초대",
    copy: "복사",
    copied: "복사됨 ✓",
    pendingIn: "받은 요청",
    pendingOut: "보낸 요청 — 대기 중",
    waiting: "대기 중",
    friendList: (n: number) => `친구 목록 — ${n}명`,
    accept: "수락",
    decline: "거절",
    remove: "삭제",
    removeConfirm: "정말 삭제?",
    noFriends: "친구가 없어요",
    noFriendsDesc: "이메일로 친구를 찾거나 링크를 공유해보세요",
    addFriendBtn: "친구 추가하기",
  },
  en: {
    title: "Friends",
    addFriend: "Add Friend",
    friendCount: (n: number) => `${n} friend${n !== 1 ? "s" : ""}`,
    addPanel: "Add Friend",
    emailLabel: "Find by email",
    emailPlaceholder: "Friend's email address",
    sendRequest: "Send Request",
    sending: "...",
    successMsg: "Friend request sent!",
    or: "or",
    inviteLabel: "Invite by link",
    copy: "Copy",
    copied: "Copied ✓",
    pendingIn: "Incoming Requests",
    pendingOut: "Sent Requests — Pending",
    waiting: "Pending",
    friendList: (n: number) => `Friends — ${n}`,
    accept: "Accept",
    decline: "Decline",
    remove: "Remove",
    removeConfirm: "Sure?",
    noFriends: "No friends yet",
    noFriendsDesc: "Find friends by email or share an invite link",
    addFriendBtn: "Add a Friend",
  },
} as const;

function generateFriendInviteLink(userId: string) {
  const token = btoa(`friend:${userId}:${Date.now()}`).replace(/=/g, "").slice(0, 16);
  return `weekedule.app/friends/invite?ref=${token}`;
}

export default function FriendsPage() {
  const { user, isGuest } = useAuthStore();
  const { language } = useSettingsStore();
  const { friends, pendingIn, pendingOut, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriendStore();
  const t = T[language];

  const [showAddPanel,    setShowAddPanel]    = useState(false);
  const [emailInput,      setEmailInput]      = useState("");
  const [sendResult,      setSendResult]      = useState<{ ok: boolean; msg: string } | null>(null);
  const [sending,         setSending]         = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  if (isGuest) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          친구 기능은 회원가입 후 이용할 수 있어요
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs">
          친구를 추가하고 함께 일정을 공유해 보세요.
        </p>
        <a
          href="/signup"
          className="mt-2 px-6 py-2.5 rounded-full btn-gradient text-sm font-bold text-on-primary"
        >
          회원가입하기
        </a>
      </div>
    );
  }

  const inviteLink = generateFriendInviteLink(user?.id ?? "");

  const handleSendRequest = async () => {
    if (!emailInput.trim() || !user) return;
    setSending(true);
    setSendResult(null);
    const result = await sendRequest(emailInput.trim());
    setSendResult({ ok: result.success, msg: result.success ? t.successMsg : result.error ?? "Error" });
    if (result.success) setEmailInput("");
    setSending(false);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(inviteLink); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (relationId: string) => {
    if (confirmRemoveId === relationId) {
      removeFriend(relationId);
      setConfirmRemoveId(null);
    } else {
      setConfirmRemoveId(relationId);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="glass-nav border-b border-outline-variant/10 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
        <button
          onClick={() => { setShowAddPanel(true); setSendResult(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-xs font-bold text-on-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          {t.addFriend}
        </button>
      </div>

      <main className="px-8 py-6 max-w-2xl flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight" style={{ fontFamily: "var(--font-manrope)" }}>
            {t.title}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">{t.friendCount(friends.length)}</p>
        </div>

        {/* 친구 추가 패널 */}
        {showAddPanel && (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">{t.addPanel}</h3>
              <button
                onClick={() => { setShowAddPanel(false); setSendResult(null); setEmailInput(""); }}
                className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div>
              <label className="label-field">{t.emailLabel}</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setSendResult(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                  placeholder={t.emailPlaceholder}
                  className="field flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSendRequest}
                  disabled={!emailInput.trim() || sending}
                  className="px-4 py-2 rounded-xl btn-gradient text-xs font-bold text-on-primary disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-all"
                >
                  {sending ? t.sending : t.sendRequest}
                </button>
              </div>
              {sendResult && (
                <p className={`text-xs mt-2 font-semibold px-3 py-2 rounded-xl border ${
                  sendResult.ok
                    ? "text-[#16a34a] bg-[#dcfce7] border-[#16a34a]/20"
                    : "text-error bg-error/5 border-error/20"
                }`}>
                  {sendResult.ok ? "✓ " : "✗ "}{sendResult.msg}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-outline-variant/20" />
              <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wide">{t.or}</span>
              <div className="flex-1 h-px bg-outline-variant/20" />
            </div>

            <div>
              <label className="label-field">{t.inviteLabel}</label>
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
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 받은 요청 */}
        {pendingIn.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-2">
              {t.pendingIn}
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold leading-none">
                {pendingIn.length}
              </span>
            </h3>
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {pendingIn.map((rel, i) => (
                <div
                  key={rel.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? "border-t border-outline-variant/10" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
                    {rel.from.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{rel.from.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{rel.from.email}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => acceptRequest(rel.id)} className="px-3 py-1.5 rounded-full btn-gradient text-xs font-bold text-on-primary">
                      {t.accept}
                    </button>
                    <button onClick={() => declineRequest(rel.id)} className="px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                      {t.decline}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 보낸 요청 */}
        {pendingOut.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
              {t.pendingOut}
            </h3>
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {pendingOut.map((rel, i) => (
                <div
                  key={rel.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? "border-t border-outline-variant/10" : ""}`}
                >
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant shrink-0">
                    {rel.to.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{rel.to.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{rel.to.email}</p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full shrink-0">
                    {t.waiting}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 친구 목록 */}
        <div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">
            {t.friendList(friends.length)}
          </h3>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-base font-bold text-on-surface mb-1">{t.noFriends}</p>
              <p className="text-sm text-on-surface-variant mb-4">{t.noFriendsDesc}</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="px-4 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary"
              >
                {t.addFriendBtn}
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {friends.map((friend, i) => {
                const memberStyle = getMemberStyle(friend.colorId);
                const isConfirm = confirmRemoveId === friend.userId;
                return (
                  <div
                    key={friend.userId}
                    className={`flex items-center gap-3 px-5 py-3.5 group hover:bg-surface-container-low transition-colors ${
                      i > 0 ? "border-t border-outline-variant/10" : ""
                    }`}
                  >
                    <div style={memberStyle} className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {friend.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface">{friend.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{friend.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(friend.userId)}
                      onBlur={() => setTimeout(() => setConfirmRemoveId(null), 200)}
                      className={`opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        isConfirm
                          ? "opacity-100 bg-error text-on-error"
                          : "text-on-surface-variant hover:text-error hover:bg-error/5 border border-outline-variant/20"
                      }`}
                    >
                      {isConfirm ? t.removeConfirm : t.remove}
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
