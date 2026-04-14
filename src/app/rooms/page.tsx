"use client";

import Link from "next/link";
import { useState } from "react";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import RoomCard from "@/components/rooms/RoomCard";
import { useAuthStore } from "@/lib/authStore";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import type { RoomColor, RoomIcon } from "@/types/room";

const T = {
  ko: {
    nav: "협업 공간",
    login: "로그인",
    createRoom: "방 만들기",
    badge: (count: number) => `${count}개의 방`,
    eyebrow: "Management",
    title: (
      <>
        함께 움직이는 팀의
        <br />
        협업 공간을 만들어보세요.
      </>
    ),
    description:
      "팀을 초대하고, 일정 겹침을 확인하고, 회의 시간을 자연스럽게 조율할 수 있어요.",
    createCardTitle: "새 방 만들기",
    createCardDescription: "새로운 협업 공간을 열고 팀과 일정을 공유해 보세요.",
    guestCreateTitle: "회원가입 후 방을 만들 수 있어요",
    guestCreateDescription: "게스트 계정은 방 생성 기능이 제한됩니다.",
    guestToast: "회원가입 후 방을 만들 수 있어요.",
  },
  en: {
    nav: "Collaboration Spaces",
    login: "Log in",
    createRoom: "Create Room",
    badge: (count: number) => `${count} room${count !== 1 ? "s" : ""}`,
    eyebrow: "Management",
    title: (
      <>
        Orchestrate your
        <br />
        shared momentum.
      </>
    ),
    description:
      "Invite your team, compare schedules, and coordinate meetings from one shared space.",
    createCardTitle: "Create New Room",
    createCardDescription: "Start a fresh collaboration space for your team.",
    guestCreateTitle: "Sign up to create rooms",
    guestCreateDescription: "Guest accounts cannot create new rooms yet.",
    guestToast: "Sign up to create a room.",
  },
} as const;

export default function RoomsPage() {
  const { rooms, addRoom } = useRoomStore();
  const { language } = useSettingsStore();
  const { isGuest } = useAuthStore();
  const t = T[language];

  const [modalOpen, setModalOpen] = useState(false);
  const [guestToast, setGuestToast] = useState(false);

  const handleCreateClick = () => {
    if (isGuest) {
      setGuestToast(true);
      setTimeout(() => setGuestToast(false), 3000);
      return;
    }
    setModalOpen(true);
  };

  const featured = rooms.find((room) => room.id === "r4");
  const regular = rooms.filter((room) => room.id !== "r4");

  const handleCreate = (data: {
    name: string;
    description: string;
    color: RoomColor;
    icon: RoomIcon;
  }) => {
    addRoom(data);
  };

  return (
    <>
      <header className="glass-nav z-30 flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-4 py-3 sm:px-6 md:px-8">
        <h2
          className="text-base font-bold text-on-surface"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {t.nav}
        </h2>
        <div className="flex items-center gap-2">
          {isGuest ? (
            <Link
              href="/login"
              className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:bg-surface-container"
            >
              {t.login}
            </Link>
          ) : null}
          <button
            onClick={handleCreateClick}
            className="btn-gradient flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold text-on-primary transition-all active:scale-95"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t.createRoom}
          </button>
        </div>
      </header>

      <main className="mobile-page-safe flex-1 overflow-y-auto px-4 py-8 sm:px-6 md:px-8">
        <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
              {t.eyebrow}
            </span>
            <h3
              className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-4xl"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {t.title}
            </h3>
            <p className="text-base leading-relaxed text-on-surface-variant">
              {t.description}
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {t.badge(rooms.length)}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regular.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}

          <button
            onClick={handleCreateClick}
            className="group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-outline-variant/30 bg-transparent p-7 text-center transition-all duration-200 hover:border-outline-variant/60 hover:bg-surface-container-low"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-surface-container-lowest">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-on-surface-variant transition-colors group-hover:text-primary"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h4
              className="mb-1 text-base font-bold text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {isGuest ? t.guestCreateTitle : t.createCardTitle}
            </h4>
            <p className="text-xs text-on-surface-variant">
              {isGuest ? t.guestCreateDescription : t.createCardDescription}
            </p>
          </button>

          {featured ? <RoomCard room={featured} featured /> : null}
        </div>
      </main>

      {isGuest ? null : (
        <CreateRoomModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleCreate}
        />
      )}

      {guestToast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-on-surface px-5 py-3 text-sm font-semibold text-surface shadow-lg md:bottom-6">
          {t.guestToast}
        </div>
      ) : null}
    </>
  );
}
