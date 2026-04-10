"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useRoomStore } from "@/lib/roomStore";
import {
  COLOR_CONFIG,
  STATUS_CONFIG,
  MEMBER_COLOR_OPTIONS,
  HEATMAP_COLOR_OPTIONS,
  getMemberStyle,
} from "@/types/room";
import RoomIconEl from "@/components/rooms/RoomIcon";
import ScheduleOverlap from "@/components/rooms/ScheduleOverlap";
import InviteModal from "@/components/rooms/InviteModal";

type Tab = "overlap" | "members";

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { rooms, updateRoom, deleteRoom, removeMember, updateMemberColor } = useRoomStore();

  const room = rooms.find((r) => r.id === id);

  const [tab,              setTab]              = useState<Tab>("overlap");
  const [confirmDelete,    setConfirmDelete]    = useState(false);
  const [confirmed,        setConfirmed]        = useState<{ label: string } | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [inviteOpen,       setInviteOpen]       = useState(false);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">Room을 찾을 수 없어요</p>
          <button onClick={() => router.push("/rooms")} className="text-primary text-sm font-semibold hover:underline">
            ← 목록으로
          </button>
        </div>
      </div>
    );
  }

  const colors = COLOR_CONFIG[room.color];
  const status = STATUS_CONFIG[room.status];

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteRoom(room.id);
    router.push("/rooms");
  };

  const handleConfirmSchedule = (slot: { dayOfWeek: number; startTime: string; endTime: string; busyMembers: string[] }) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    setConfirmed({ label: `${days[slot.dayOfWeek]}요일 ${slot.startTime}–${slot.endTime}` });
    setTimeout(() => setConfirmed(null), 4000);
  };

  return (
    <>
      {/* Topbar */}
      <header className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center gap-3 shrink-0 z-30">
        <button
          onClick={() => router.push("/rooms")}
          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${colors.iconBg} ${colors.iconText} shrink-0`}>
          <RoomIconEl icon={room.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-on-surface truncate" style={{ fontFamily: "var(--font-manrope)" }}>
            {room.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-on-surface-variant">{room.members.length}명</span>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </header>

      {/* 탭 */}
      <div className="px-8 pt-4 flex gap-1 shrink-0">
        {([ ["overlap", "Schedule Overlap"], ["members", "Team 관리"] ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-y-auto px-8 py-5">
        {tab === "overlap" && (
          <>
            <div className="mb-6">
              <h3
                className="text-3xl font-extrabold text-on-surface tracking-tight"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Schedule Overlap
              </h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-lg">
                멤버들의 시간표가 겹치는 구간을 히트맵으로 확인하고 최적 미팅 시간을 찾아보세요. 셀을 클릭해 일정을 확정할 수 있어요.
              </p>
            </div>

            {room.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p className="text-base font-bold text-on-surface mb-1">멤버가 없어요</p>
                <p className="text-sm text-on-surface-variant mb-4">Team 관리 탭에서 먼저 멤버를 초대해주세요</p>
                <button onClick={() => setTab("members")} className="px-4 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary">
                  멤버 초대하러 가기
                </button>
              </div>
            ) : (
              <ScheduleOverlap
                members={room.members}
                heatmapColor={room.heatmapColor}
                onConfirm={handleConfirmSchedule}
              />
            )}
          </>
        )}

        {tab === "members" && (
          <div className="max-w-xl flex flex-col gap-5">
            <div>
              <h3 className="text-2xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
                Team 관리
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">멤버 초대 및 색상, 히트맵 색상을 설정하세요</p>
            </div>

            {/* 멤버 목록 */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 overflow-hidden">
              {room.members.length === 0 && (
                <p className="text-sm text-on-surface-variant p-5">아직 멤버가 없어요</p>
              )}
              {room.members.map((m, i) => {
                const isExpanded = expandedMemberId === m.id;
                const memberStyle = getMemberStyle(m.colorId);
                return (
                  <div
                    key={m.id}
                    className={`${i > 0 ? "border-t border-outline-variant/10" : ""}`}
                  >
                    {/* 멤버 행 */}
                    <div className="flex items-center gap-3 px-5 py-3.5 group hover:bg-surface-container-low transition-colors">
                      <div
                        style={memberStyle}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      >
                        {m.initials[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{m.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{m.events.length}개 일정 등록됨</p>
                      </div>

                      {/* 색상 변경 버튼 */}
                      <button
                        onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-surface-container"
                        title="색상 변경"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                        </svg>
                      </button>

                      {/* 멤버 제거 */}
                      <button
                        onClick={() => removeMember(room.id, m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>

                    {/* 색상 스와치 패널 */}
                    {isExpanded && (
                      <div className="px-5 pb-4 flex flex-wrap gap-2">
                        {MEMBER_COLOR_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              updateMemberColor(room.id, m.id, opt.id);
                              setExpandedMemberId(null);
                            }}
                            title={opt.label}
                            style={{ backgroundColor: opt.bg, color: opt.text }}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              m.colorId === opt.id
                                ? "ring-2 ring-offset-1 ring-current scale-105"
                                : "opacity-70 hover:opacity-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 멤버 초대 버튼 */}
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl btn-gradient text-sm font-bold text-on-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              멤버 초대하기
            </button>

            {/* 히트맵 색상 */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-5">
              <h4 className="text-sm font-bold text-on-surface mb-1">히트맵 색상</h4>
              <p className="text-[11px] text-on-surface-variant mb-3">Schedule Overlap 히트맵의 기준 색상을 선택하세요</p>
              <div className="flex gap-2 flex-wrap">
                {HEATMAP_COLOR_OPTIONS.map((opt) => {
                  const isActive = room.heatmapColor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => updateRoom(room.id, { heatmapColor: opt.id })}
                      title={opt.label}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isActive
                          ? "border-current scale-105 shadow-sm"
                          : "border-outline-variant/20 hover:border-outline-variant/60 opacity-60 hover:opacity-100"
                      }`}
                      style={{ color: opt.hex }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: opt.hex }}
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room 설정 */}
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-5 flex flex-col gap-3">
              <h4 className="text-sm font-bold text-on-surface">Room 설정</h4>
              <button
                onClick={() => updateRoom(room.id, { status: room.status === "active" ? "waiting" : "active" })}
                className="py-2.5 px-4 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors text-left"
              >
                {room.status === "active" ? "⏸ Waiting으로 변경" : "▶ Active로 변경"}
              </button>
              <button
                onClick={handleDelete}
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-left ${
                  confirmDelete ? "bg-error text-on-error" : "border border-error/30 text-error hover:bg-error/5"
                }`}
              >
                {confirmDelete ? "정말 삭제? 다시 클릭하면 삭제됩니다" : "🗑 Room 삭제"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 스케줄 확정 토스트 */}
      {confirmed && (
        <div className="fixed bottom-6 right-6 z-[60] bg-on-surface text-inverse-on-surface px-5 py-3 rounded-2xl text-sm font-semibold shadow-ambient flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <span className="text-[#4ade80]">✓</span>
          {confirmed.label} 확정되었어요!
        </div>
      )}

      {/* 초대 모달 */}
      {inviteOpen && (
        <InviteModal roomId={room.id} onClose={() => setInviteOpen(false)} />
      )}
    </>
  );
}
