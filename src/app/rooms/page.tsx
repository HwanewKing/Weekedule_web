"use client";

import { useState } from "react";
import { useRoomStore } from "@/lib/roomStore";
import { useSettingsStore } from "@/lib/settingsStore";
import RoomCard from "@/components/rooms/RoomCard";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import { RoomColor, RoomIcon } from "@/types/room";

export default function RoomsPage() {
  const { rooms, addRoom } = useRoomStore();
  const { language } = useSettingsStore();
  const [modalOpen, setModalOpen] = useState(false);

  // 마지막 카드를 featured(wide)로
  const featured = rooms.find((r) => r.id === "r4");
  const regular  = rooms.filter((r) => r.id !== "r4");

  const handleCreate = (data: { name: string; description: string; color: RoomColor; icon: RoomIcon }) => {
    addRoom(data);
  };

  return (
    <>
      {/* Topbar */}
      <header className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center justify-between shrink-0 z-30">
        <h2 className="text-base font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
          Collaboration Spaces
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Room
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        {/* Hero */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">
              Management
            </span>
            <h3
              className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight mb-3"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {language === "ko" ? <>팀의 흐름을<br />함께 만들어가세요.</> : <>Orchestrate your<br />shared momentum.</>}
            </h3>
            <p className="text-base text-on-surface-variant leading-relaxed">
              {language === "ko"
                ? "공유 룸은 팀 생산성의 중심입니다. 룸에 참여하고, 관리하며, 팀 전체의 일정을 유연하게 동기화하세요."
                : "Shared rooms are the pulse of your productivity. Join, manage, and sync your schedules across teams in a fluid editorial environment."}
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {rooms.length}개 Room
            </span>
          </div>
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Regular cards */}
          {regular.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}

          {/* Create New Room card */}
          <button
            onClick={() => setModalOpen(true)}
            className="group relative bg-transparent border-2 border-dashed border-outline-variant/30 rounded-3xl p-7 flex flex-col items-center justify-center text-center transition-all duration-200 hover:bg-surface-container-low hover:border-outline-variant/60 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:bg-surface-container-lowest transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant group-hover:text-primary transition-colors">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <h4 className="text-base font-bold text-on-surface mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
              Create New Room
            </h4>
            <p className="text-xs text-on-surface-variant">Start a new shared collaboration</p>
          </button>

          {/* Featured card (Design Critique) */}
          {featured && <RoomCard room={featured} featured />}
        </div>
      </main>

      <CreateRoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />
    </>
  );
}
