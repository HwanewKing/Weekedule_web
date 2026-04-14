"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useFriendStore } from "@/lib/friendStore";
import { useSettingsStore } from "@/lib/settingsStore";

interface Props {
  token: string;
}

interface InviterPreview {
  id: string;
  name: string;
}

type Status =
  | "loading"
  | "ready"
  | "sending"
  | "sent"
  | "accepted"
  | "already"
  | "error";

const T = {
  ko: {
    title: "친구 초대",
    subtitle: "공유 링크를 통해 친구 요청을 간편하게 보낼 수 있어요.",
    invalidLink: "유효하지 않은 친구 초대 링크예요.",
    missingLink: "친구 초대 링크 정보가 없어요.",
    networkError: "네트워크 오류가 발생했어요.",
    requestError: "친구 요청을 보내지 못했어요.",
    backHome: "홈으로 이동",
    openFriends: "친구 페이지로 이동",
    loading: "친구 초대 링크를 확인하는 중...",
    inviteFrom: (name: string) => `${name}님이 친구 링크를 공유했어요`,
    inviteDescription:
      "로그인 후 버튼을 누르면 바로 친구 요청을 보낼 수 있어요.",
    loginRequired: "친구 요청을 보내려면 로그인 또는 회원가입이 필요해요.",
    login: "로그인",
    signup: "회원가입",
    sendRequest: "친구 요청 보내기",
    sending: "보내는 중...",
    sentTitle: "친구 요청을 보냈어요",
    sentDescription: "상대가 수락하면 바로 친구 목록에서 확인할 수 있어요.",
    acceptedTitle: "이미 서로 연결되었어요",
    acceptedDescription:
      "상대가 먼저 보낸 요청이 있어서 바로 친구 관계로 처리했어요.",
    alreadyTitle: "이미 친구 요청이 진행 중이거나 친구 관계예요",
    alreadyDescription: "친구 페이지에서 현재 상태를 확인해 보세요.",
    selfTitle: "내 친구 초대 링크예요",
    selfDescription: "이 링크는 다른 사람에게 공유해서 친구 요청을 받을 수 있어요.",
  },
  en: {
    title: "Friend Invite",
    subtitle: "Send a friend request quickly through a shared invite link.",
    invalidLink: "This friend invite link is not valid.",
    missingLink: "No friend invite link was provided.",
    networkError: "A network error occurred.",
    requestError: "Could not send the friend request.",
    backHome: "Back to Home",
    openFriends: "Go to Friends",
    loading: "Checking the friend invite link...",
    inviteFrom: (name: string) => `${name} shared a friend invite link`,
    inviteDescription: "Log in and tap the button to send a friend request.",
    loginRequired: "You need to log in or sign up to send a friend request.",
    login: "Log In",
    signup: "Sign Up",
    sendRequest: "Send Friend Request",
    sending: "Sending...",
    sentTitle: "Friend request sent",
    sentDescription: "You will see them in your friends list after they accept.",
    acceptedTitle: "You are already connected",
    acceptedDescription:
      "They had already sent you a request, so we connected you right away.",
    alreadyTitle: "A friend request or friendship already exists",
    alreadyDescription: "Open the Friends page to check the current status.",
    selfTitle: "This is your own invite link",
    selfDescription: "Share this link with someone else to receive a friend request.",
  },
} as const;

export default function FriendInviteClient({ token }: Props) {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const { fetchFriends } = useFriendStore();
  const { language } = useSettingsStore();
  const t = T[language];

  const [inviter, setInviter] = useState<InviterPreview | null>(null);
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [errorMsg, setErrorMsg] = useState("");

  const nextPath = useMemo(
    () => `/friends/invite?ref=${encodeURIComponent(token)}`,
    [token]
  );
  const encodedNextPath = encodeURIComponent(nextPath);
  const isSelfInvite = !!inviter && !!user && !isGuest && user.id === inviter.id;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadInvite = async () => {
      try {
        const response = await fetch(
          `/api/friends/invite/${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.inviter) {
          setErrorMsg(data.error ?? t.invalidLink);
          setStatus("error");
          return;
        }

        setInviter(data.inviter);
        setErrorMsg("");
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setErrorMsg(t.networkError);
        setStatus("error");
      }
    };

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [token, t.invalidLink, t.networkError]);

  const handleSendRequest = async () => {
    if (!token) return;

    if (!user || isGuest) {
      router.push(`/login?next=${encodedNextPath}`);
      return;
    }

    if (isSelfInvite) {
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const response = await fetch(
        `/api/friends/invite/${encodeURIComponent(token)}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error ?? t.requestError);
        if (response.status === 409) {
          setStatus("already");
        } else {
          setStatus("error");
        }
        return;
      }

      await fetchFriends();
      setStatus(data.autoAccepted ? "accepted" : "sent");
    } catch {
      setErrorMsg(t.networkError);
      setStatus("error");
    }
  };

  const inviterInitials = inviter?.name.slice(0, 2).toUpperCase() ?? "FR";

  const renderStatusBlock = () => {
    if (status === "sent") {
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#16a34a]"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="mb-1 text-base font-bold text-on-surface">
              {t.sentTitle}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t.sentDescription}
            </p>
          </div>
          <button
            onClick={() => router.replace("/friends")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t.openFriends}
          </button>
        </div>
      );
    }

    if (status === "accepted" || status === "already" || isSelfInvite) {
      const title =
        status === "accepted"
          ? t.acceptedTitle
          : status === "already"
            ? t.alreadyTitle
            : t.selfTitle;
      const description =
        status === "accepted"
          ? t.acceptedDescription
          : status === "already"
            ? errorMsg || t.alreadyDescription
            : t.selfDescription;

      return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="mb-1 text-base font-bold text-on-surface">{title}</p>
            <p className="text-sm text-on-surface-variant">{description}</p>
          </div>
          <button
            onClick={() => router.replace("/friends")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t.openFriends}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-primary"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Weekedule
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            Orchestrated Flow
          </p>
        </div>

        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-7 shadow-ambient">
          <h1
            className="text-xl font-extrabold text-on-surface"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {t.title}
          </h1>
          <p className="mt-1 text-xs text-on-surface-variant">{t.subtitle}</p>

          {status === "loading" ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-on-surface-variant">{t.loading}</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-error"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-base font-bold text-on-surface">
                  {t.invalidLink}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {errorMsg || (!token ? t.missingLink : t.invalidLink)}
                </p>
              </div>
              <Link
                href="/"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t.backHome}
              </Link>
            </div>
          ) : null}

          {(status === "ready" || status === "sending") && inviter ? (
            <div className="mt-6 flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
                  {inviterInitials}
                </div>
                <h2
                  className="text-xl font-extrabold text-on-surface"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {t.inviteFrom(inviter.name)}
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {t.inviteDescription}
                </p>
              </div>

              {!user || isGuest ? (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-xs text-on-surface-variant">
                    {t.loginRequired}
                  </p>
                  <Link
                    href={`/login?next=${encodedNextPath}`}
                    className="btn-gradient w-full rounded-full py-3 text-center text-sm font-bold text-on-primary"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href={`/signup?next=${encodedNextPath}`}
                    className="w-full rounded-full border border-outline-variant/40 py-3 text-center text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container/60"
                  >
                    {t.signup}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={status === "sending" || isSelfInvite}
                  className="btn-gradient w-full rounded-full py-3 text-sm font-bold text-on-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "sending" ? t.sending : t.sendRequest}
                </button>
              )}
            </div>
          ) : null}

          {renderStatusBlock()}
        </div>
      </div>
    </div>
  );
}
