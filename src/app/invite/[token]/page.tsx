"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RoomIconEl from "@/components/rooms/RoomIcon";
import { useAuthStore } from "@/lib/authStore";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { getRoomColorHex, hexToRgba, type RoomColor, type RoomIcon } from "@/types/room";

interface RoomPreview {
  id: string;
  name: string;
  description: string;
  color: RoomColor;
  icon: RoomIcon;
  memberCount: number;
}

type Status = "loading" | "ready" | "joining" | "joined" | "already" | "error";

const T = {
  ko: {
    invalidLink: "초대 링크가 유효하지 않아요",
    backHome: "홈으로 돌아가기",
    loading: "초대 링크를 확인하는 중...",
    roomInvite: "방 초대",
    memberCount: (count: number) => `${count}명 참여 중`,
    loginRequired: "참여하려면 로그인 또는 회원가입이 필요해요.",
    loginJoin: "로그인하고 참여하기",
    signupJoin: "회원가입하고 참여하기",
    joinRoom: "방 참여하기",
    joining: "참여 중...",
    alreadyJoined: "이미 참여 중인 방이에요",
    moveToRoom: "방으로 이동하기",
    joined: "참여가 완료되었어요!",
    moving: (name: string) => `${name} 방으로 이동하고 있어요.`,
    invalidError: "유효하지 않은 링크예요.",
    networkError: "네트워크 오류가 발생했어요.",
    joinError: "방 참여에 실패했어요.",
  },
  en: {
    invalidLink: "This invite link is not valid.",
    backHome: "Back to home",
    loading: "Checking invite link...",
    roomInvite: "Room Invite",
    memberCount: (count: number) => `${count} member${count !== 1 ? "s" : ""} joined`,
    loginRequired: "You need to log in or sign up to join this room.",
    loginJoin: "Log in to Join",
    signupJoin: "Sign Up to Join",
    joinRoom: "Join Room",
    joining: "Joining...",
    alreadyJoined: "You're already in this room.",
    moveToRoom: "Go to Room",
    joined: "You're in!",
    moving: (name: string) => `Moving you to ${name}.`,
    invalidError: "This invite link is not valid.",
    networkError: "A network error occurred.",
    joinError: "Failed to join the room.",
  },
} as const;

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const { language } = useSettingsStore();
  const { fetchRooms } = useRoomStore();
  const [room, setRoom] = useState<RoomPreview | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const t = T[language];

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.room) {
          setRoom(data.room);
          setStatus("ready");
        } else {
          setErrorMsg(data.error ?? t.invalidError);
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg(t.networkError);
        setStatus("error");
      });
  }, [t.invalidError, t.networkError, token]);

  const handleJoin = async () => {
    if (!user || isGuest) {
      router.push(`/login?next=/invite/${token}`);
      return;
    }

    setStatus("joining");
    const res = await fetch(`/api/invite/${token}`, { method: "POST" });
    const data = await res.json();

    if (res.status === 409) {
      setStatus("already");
      return;
    }

    if (!res.ok) {
      setErrorMsg(data.error ?? t.joinError);
      setStatus("error");
      return;
    }

    await fetchRooms();
    setStatus("joined");
    setTimeout(() => router.replace(`/rooms/${data.roomId}`), 1500);
  };

  const hex = room ? getRoomColorHex(room.color) : "#6750a4";

  return (
    <div className="flex flex-1 items-center justify-center bg-surface p-6">
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
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-on-surface-variant">{t.loading}</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-base font-bold text-on-surface">{t.invalidLink}</p>
                <p className="text-sm text-on-surface-variant">{errorMsg}</p>
              </div>
              <Link href="/home" className="text-sm font-semibold text-primary hover:underline">
                {t.backHome}
              </Link>
            </div>
          ) : null}

          {(status === "ready" || status === "joining") && room ? (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <p className="mb-4 text-xs text-on-surface-variant">{t.roomInvite}</p>
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: hexToRgba(hex, 0.15), color: hex }}
                >
                  <span style={{ transform: "scale(1.8)" }}>
                    <RoomIconEl icon={room.icon} />
                  </span>
                </div>
                <h2 className="mb-1 text-xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                  {room.name}
                </h2>
                {room.description ? (
                  <p className="text-sm text-on-surface-variant">{room.description}</p>
                ) : null}
                <p className="mt-2 text-xs text-on-surface-variant">{t.memberCount(room.memberCount)}</p>
              </div>

              {!user || isGuest ? (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-xs text-on-surface-variant">{t.loginRequired}</p>
                  <Link
                    href={`/login?next=/invite/${token}`}
                    className="btn-gradient w-full rounded-full py-3 text-center text-sm font-bold text-on-primary"
                  >
                    {t.loginJoin}
                  </Link>
                  <Link
                    href={`/signup?next=/invite/${token}`}
                    className="w-full rounded-full border border-outline-variant/40 py-3 text-center text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container/60"
                  >
                    {t.signupJoin}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={status === "joining"}
                  className="btn-gradient w-full rounded-full py-3 text-sm font-bold text-on-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "joining" ? t.joining : t.joinRoom}
                </button>
              )}
            </div>
          ) : null}

          {status === "already" && room ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-base font-bold text-on-surface">{t.alreadyJoined}</p>
                <p className="text-sm text-on-surface-variant">{room.name}</p>
              </div>
              <button onClick={() => router.replace(`/rooms/${room.id}`)} className="text-sm font-semibold text-primary hover:underline">
                {t.moveToRoom}
              </button>
            </div>
          ) : null}

          {status === "joined" && room ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#16a34a]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-base font-bold text-on-surface">{t.joined}</p>
                <p className="text-sm text-on-surface-variant">{t.moving(room.name)}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
