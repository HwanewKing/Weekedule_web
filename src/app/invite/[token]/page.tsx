"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useRoomStore } from "@/lib/roomStore";
import RoomIconEl from "@/components/rooms/RoomIcon";
import { getRoomColorHex, hexToRgba } from "@/types/room";
import Link from "next/link";

interface RoomPreview {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  memberCount: number;
}

type Status = "loading" | "ready" | "joining" | "joined" | "already" | "error";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const { fetchRooms } = useRoomStore();

  const [room, setRoom] = useState<RoomPreview | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.room) { setRoom(data.room); setStatus("ready"); }
        else { setErrorMsg(data.error ?? "유효하지 않은 링크예요"); setStatus("error"); }
      })
      .catch(() => { setErrorMsg("네트워크 오류가 발생했어요"); setStatus("error"); });
  }, [token]);

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?next=/invite/${token}`);
      return;
    }
    setStatus("joining");
    const res = await fetch(`/api/invite/${token}`, { method: "POST" });
    const data = await res.json();
    if (res.status === 409) { setStatus("already"); return; }
    if (!res.ok) { setErrorMsg(data.error ?? "참여에 실패했어요"); setStatus("error"); return; }
    await fetchRooms();
    setStatus("joined");
    setTimeout(() => router.replace(`/rooms/${data.roomId}`), 1500);
  };

  const hex = room ? getRoomColorHex(room.color) : "#6750a4";

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-primary tracking-tight" style={{ fontFamily: "var(--font-manrope)" }}>
            Weekedule
          </Link>
          <p className="text-xs text-on-surface-variant mt-1 font-medium tracking-wide uppercase">Orchestrated Flow</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-7 shadow-ambient border border-outline-variant/10">
          {status === "loading" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-on-surface-variant">초대 링크 확인 중...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-on-surface mb-1">링크가 유효하지 않아요</p>
                <p className="text-sm text-on-surface-variant">{errorMsg}</p>
              </div>
              <Link href="/home" className="text-primary text-sm font-semibold hover:underline">홈으로 돌아가기</Link>
            </div>
          )}

          {(status === "ready" || status === "joining") && room && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant mb-4">Room 초대장</p>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: hexToRgba(hex, 0.15), color: hex }}
                >
                  <span style={{ transform: "scale(1.8)" }}>
                    <RoomIconEl icon={room.icon} />
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-on-surface mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
                  {room.name}
                </h2>
                {room.description && (
                  <p className="text-sm text-on-surface-variant">{room.description}</p>
                )}
                <p className="text-xs text-on-surface-variant mt-2">{room.memberCount}명 참여 중</p>
              </div>

              {!user && !isGuest ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-center text-on-surface-variant">참여하려면 로그인이 필요해요</p>
                  <Link
                    href={`/login?next=/invite/${token}`}
                    className="w-full py-3 rounded-full btn-gradient text-sm font-bold text-on-primary text-center"
                  >
                    로그인하고 참여하기
                  </Link>
                  <Link
                    href={`/signup?next=/invite/${token}`}
                    className="w-full py-3 rounded-full border border-outline-variant/40 text-sm font-semibold text-on-surface-variant text-center hover:bg-surface-container/60 transition-all"
                  >
                    회원가입 후 참여하기
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={status === "joining"}
                  className="w-full py-3 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {status === "joining" ? "참여 중..." : "Room 참여하기"}
                </button>
              )}
            </div>
          )}

          {status === "already" && room && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-on-surface mb-1">이미 참여 중인 Room이에요</p>
                <p className="text-sm text-on-surface-variant">{room.name}</p>
              </div>
              <button onClick={() => router.replace(`/rooms/${room.id}`)} className="text-primary text-sm font-semibold hover:underline">
                Room으로 이동하기
              </button>
            </div>
          )}

          {status === "joined" && room && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#dcfce7] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#16a34a]">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-on-surface mb-1">참여 완료!</p>
                <p className="text-sm text-on-surface-variant">{room.name}으로 이동할게요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
