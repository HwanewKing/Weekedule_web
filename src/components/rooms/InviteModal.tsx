"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useFriendStore } from "@/lib/friendStore";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { getMemberStyle } from "@/types/room";

type InviteTab = "link" | "friend";

interface Props {
  roomId: string;
  onClose: () => void;
}

const T = {
  ko: {
    title: "멤버 초대하기",
    subtitle: "친구를 초대하거나 링크를 공유해 보세요.",
    friendTab: "친구 초대",
    linkTab: "링크 초대",
    noFriends: "아직 친구가 없어요.",
    noFriendsDesc: "친구 페이지에서 먼저 친구를 추가해 보세요.",
    alreadyMember: "이미 참여 중",
    added: "추가 완료",
    invite: "초대",
    linkTitle: "초대 링크 (7일 유효)",
    generating: "링크 생성 중...",
    createLink: "링크 생성하기",
    copy: "복사",
    copied: "복사 완료",
    linkNote: "이 링크로 입장하면 방 멤버 목록에 자동으로 추가됩니다.",
    linkError: "초대 링크를 만들지 못했어요. 다시 시도해 주세요.",
  },
  en: {
    title: "Invite Members",
    subtitle: "Invite friends or share a link.",
    friendTab: "Invite Friends",
    linkTab: "Invite by Link",
    noFriends: "No friends yet.",
    noFriendsDesc: "Add friends first from the Friends page.",
    alreadyMember: "Already joined",
    added: "Added",
    invite: "Invite",
    linkTitle: "Invite Link (valid for 7 days)",
    generating: "Generating link...",
    createLink: "Create Link",
    copy: "Copy",
    copied: "Copied",
    linkNote: "Anyone joining from this link will be added to the room automatically.",
    linkError: "Could not create the invite link. Please try again.",
  },
} as const;

export default function InviteModal({ roomId, onClose }: Props) {
  const { language } = useSettingsStore();
  const { user } = useAuthStore();
  const { friends } = useFriendStore();
  const { rooms, addMember } = useRoomStore();
  const t = T[language];

  const [tab, setTab] = useState<InviteTab>("friend");
  const [copied, setCopied] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  const room = rooms.find((item) => item.id === roomId);
  const existingMemberUserIds = new Set(
    room?.members.map((member) => member.userId) ?? []
  );

  const generateLink = async () => {
    if (inviteLink) return;

    setLinkLoading(true);
    setLinkError("");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();

      if (data.token) {
        setInviteLink(`${window.location.origin}/invite/${data.token}`);
        return;
      }

      setInviteLink(null);
      setLinkError(data.error ?? t.linkError);
    } catch {
      setInviteLink(null);
      setLinkError(t.linkError);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleTabChange = (nextTab: InviteTab) => {
    setTab(nextTab);
    if (nextTab === "link") {
      void generateLink();
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      // noop
    }

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
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-outline-variant/10 bg-surface-container-lowest shadow-ambient">
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div>
            <h2
              className="text-lg font-extrabold text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {t.title}
            </h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-high"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex gap-1 px-6">
          {([
            ["friend", t.friendTab],
            ["link", t.linkTab],
          ] as [InviteTab, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                tab === value
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6">
          {tab === "friend" ? (
            <div className="flex flex-col gap-2">
              {friends.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-on-surface-variant">{t.noFriends}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {t.noFriendsDesc}
                  </p>
                </div>
              ) : (
                <div className="-mx-1 flex max-h-72 flex-col gap-1 overflow-y-auto px-1">
                  {friends.map((friend) => {
                    const isAlreadyMember = existingMemberUserIds.has(friend.userId);
                    const isAdded = addedIds.has(friend.userId);
                    const memberStyle = getMemberStyle(friend.colorId);

                    return (
                      <div
                        key={friend.userId}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-container"
                      >
                        <div
                          style={memberStyle}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                        >
                          {friend.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-on-surface">
                            {friend.name}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {friend.email}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isAlreadyMember ? (
                            <span className="rounded-full bg-surface-container px-2.5 py-1 text-[10px] text-on-surface-variant">
                              {t.alreadyMember}
                            </span>
                          ) : isAdded ? (
                            <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-semibold text-[#16a34a]">
                              {t.added}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInviteFriend(friend.userId)}
                              className="btn-gradient rounded-full px-3 py-1.5 text-xs font-bold text-on-primary"
                            >
                              {t.invite}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {tab === "link" ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-surface-container p-4">
                <p className="mb-2 text-xs font-medium text-on-surface-variant">
                  {t.linkTitle}
                </p>
                {linkLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-on-surface-variant">
                      {t.generating}
                    </span>
                  </div>
                ) : inviteLink ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="flex-1 truncate rounded-xl bg-surface-container-high px-3 py-2 font-mono text-xs text-on-surface">
                      {inviteLink}
                    </code>
                    <button
                      onClick={handleCopy}
                      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        copied
                          ? "bg-[#dcfce7] text-[#16a34a]"
                          : "btn-gradient text-on-primary"
                      }`}
                    >
                      {copied ? t.copied : t.copy}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => void generateLink()}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t.createLink}
                  </button>
                )}
              </div>
              {linkError ? (
                <p className="rounded-2xl border border-error/20 bg-error/5 px-3 py-2 text-xs font-semibold text-error">
                  {linkError}
                </p>
              ) : null}
              <p className="text-center text-[11px] text-on-surface-variant">
                {t.linkNote}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
