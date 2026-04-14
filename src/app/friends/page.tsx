"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useFriendStore } from "@/lib/friendStore";
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
    sending: "보내는 중...",
    successMsg: "친구 요청을 보냈어요!",
    or: "또는",
    inviteLabel: "링크로 초대",
    copy: "복사",
    copied: "복사 완료",
    pendingIn: "받은 요청",
    pendingOut: "보낸 요청",
    waiting: "대기 중",
    friendList: (n: number) => `친구 목록 ${n}명`,
    accept: "수락",
    decline: "거절",
    remove: "삭제",
    removeConfirm: "정말 삭제?",
    noFriends: "아직 친구가 없어요",
    noFriendsDesc: "이메일로 친구를 찾거나 초대 링크를 공유해 보세요.",
    addFriendBtn: "친구 추가하기",
    guestTitle: "친구 기능은 회원가입 후 이용할 수 있어요",
    guestDescription: "친구를 추가하고 함께 일정을 공유해 보세요.",
    login: "로그인",
    signup: "회원가입",
    inviteHost: "weekedule.app/friends/invite?ref=",
  },
  en: {
    title: "Friends",
    addFriend: "Add Friend",
    friendCount: (n: number) => `${n} friend${n !== 1 ? "s" : ""}`,
    addPanel: "Add Friend",
    emailLabel: "Find by email",
    emailPlaceholder: "Friend's email address",
    sendRequest: "Send Request",
    sending: "Sending...",
    successMsg: "Friend request sent!",
    or: "or",
    inviteLabel: "Invite by link",
    copy: "Copy",
    copied: "Copied",
    pendingIn: "Incoming Requests",
    pendingOut: "Sent Requests",
    waiting: "Pending",
    friendList: (n: number) => `Friends ${n}`,
    accept: "Accept",
    decline: "Decline",
    remove: "Remove",
    removeConfirm: "Remove?",
    noFriends: "No friends yet",
    noFriendsDesc: "Find friends by email or share an invite link.",
    addFriendBtn: "Add a Friend",
    guestTitle: "Friend features are available after sign up",
    guestDescription: "Add friends and share schedules together.",
    login: "Log in",
    signup: "Sign Up",
    inviteHost: "weekedule.app/friends/invite?ref=",
  },
} as const;

function generateFriendInviteLink(userId: string, prefix: string) {
  const token = btoa(`friend:${userId}:${Date.now()}`).replace(/=/g, "").slice(0, 16);
  return `${prefix}${token}`;
}

export default function FriendsPage() {
  const { user, isGuest } = useAuthStore();
  const { language } = useSettingsStore();
  const {
    friends,
    pendingIn,
    pendingOut,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriendStore();
  const t = T[language];

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  if (isGuest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.guestTitle}
        </h3>
        <p className="max-w-xs text-sm text-on-surface-variant">{t.guestDescription}</p>
        <div className="mt-2 flex gap-2">
          <a
            href="/login"
            className="rounded-full border border-outline-variant/40 px-6 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container"
          >
            {t.login}
          </a>
          <a href="/signup" className="btn-gradient rounded-full px-6 py-2.5 text-sm font-bold text-on-primary">
            {t.signup}
          </a>
        </div>
      </div>
    );
  }

  const inviteLink = generateFriendInviteLink(user?.id ?? "", t.inviteHost);

  const handleSendRequest = async () => {
    if (!emailInput.trim() || !user) return;

    setSending(true);
    setSendResult(null);

    const result = await sendRequest(emailInput.trim());
    setSendResult({
      ok: result.success,
      msg: result.success ? t.successMsg : result.error ?? "Error",
    });

    if (result.success) setEmailInput("");
    setSending(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // noop
    }
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
      <div className="glass-nav flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <h2 className="text-sm font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          {t.title}
        </h2>
        <button
          onClick={() => {
            setShowAddPanel(true);
            setSendResult(null);
          }}
          className="btn-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-on-primary"
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

      <main className="flex max-w-2xl flex-col gap-6 px-8 py-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">{t.friendCount(friends.length)}</p>
        </div>

        {showAddPanel ? (
          <div className="flex flex-col gap-4 rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">{t.addPanel}</h3>
              <button
                onClick={() => {
                  setShowAddPanel(false);
                  setSendResult(null);
                  setEmailInput("");
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-high"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div>
              <label className="label-field">{t.emailLabel}</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => {
                    setEmailInput(event.target.value);
                    setSendResult(null);
                  }}
                  onKeyDown={(event) => event.key === "Enter" && handleSendRequest()}
                  placeholder={t.emailPlaceholder}
                  className="field flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSendRequest}
                  disabled={!emailInput.trim() || sending}
                  className="btn-gradient shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-on-primary transition-all disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? t.sending : t.sendRequest}
                </button>
              </div>
              {sendResult ? (
                <p
                  className={`mt-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                    sendResult.ok
                      ? "border-[#16a34a]/20 bg-[#dcfce7] text-[#16a34a]"
                      : "border-error/20 bg-error/5 text-error"
                  }`}
                >
                  {sendResult.msg}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/20" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                {t.or}
              </span>
              <div className="h-px flex-1 bg-outline-variant/20" />
            </div>

            <div>
              <label className="label-field">{t.inviteLabel}</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl bg-surface-container px-3 py-2.5 font-mono text-xs text-on-surface">
                  {inviteLink}
                </code>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                    copied ? "bg-[#dcfce7] text-[#16a34a]" : "btn-gradient text-on-primary"
                  }`}
                >
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {pendingIn.length > 0 ? (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.pendingIn}
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-on-primary">
                {pendingIn.length}
              </span>
            </h3>
            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
              {pendingIn.map((relation, index) => (
                <div
                  key={relation.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    index > 0 ? "border-t border-outline-variant/10" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                    {relation.from.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface">{relation.from.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{relation.from.email}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => acceptRequest(relation.id)} className="btn-gradient rounded-full px-3 py-1.5 text-xs font-bold text-on-primary">
                      {t.accept}
                    </button>
                    <button
                      onClick={() => declineRequest(relation.id)}
                      className="rounded-full border border-outline-variant/30 px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
                    >
                      {t.decline}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {pendingOut.length > 0 ? (
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.pendingOut}
            </h3>
            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
              {pendingOut.map((relation, index) => (
                <div
                  key={relation.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    index > 0 ? "border-t border-outline-variant/10" : ""
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                    {relation.to.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface">{relation.to.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{relation.to.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-1 text-[10px] text-on-surface-variant">
                    {t.waiting}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            {t.friendList(friends.length)}
          </h3>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="mb-1 text-base font-bold text-on-surface">{t.noFriends}</p>
              <p className="mb-4 text-sm text-on-surface-variant">{t.noFriendsDesc}</p>
              <button
                onClick={() => setShowAddPanel(true)}
                className="btn-gradient rounded-full px-4 py-2 text-sm font-bold text-on-primary"
              >
                {t.addFriendBtn}
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest">
              {friends.map((friend, index) => {
                const memberStyle = getMemberStyle(friend.colorId);
                const isConfirm = confirmRemoveId === friend.userId;

                return (
                  <div
                    key={friend.userId}
                    className={`group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-container-low ${
                      index > 0 ? "border-t border-outline-variant/10" : ""
                    }`}
                  >
                    <div
                      style={memberStyle}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    >
                      {friend.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-on-surface">{friend.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{friend.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(friend.userId)}
                      onBlur={() => setTimeout(() => setConfirmRemoveId(null), 200)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                        isConfirm
                          ? "bg-error text-on-error opacity-100"
                          : "border border-outline-variant/20 text-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-error/5 hover:text-error"
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
