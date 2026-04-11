"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useRoomStore } from "@/lib/roomStore";
import { useAuthStore } from "@/lib/authStore";
import { useWeekedualeStore } from "@/lib/store";
import {
  MEMBER_COLOR_OPTIONS,
  HEATMAP_COLOR_OPTIONS,
  getMemberStyle,
  getRoomColorHex,
  hexToRgba,
} from "@/types/room";
import RoomIconEl from "@/components/rooms/RoomIcon";
import ScheduleOverlap from "@/components/rooms/ScheduleOverlap";
import InviteModal from "@/components/rooms/InviteModal";

type Tab = "overlap" | "members";

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { rooms, updateRoom, deleteRoom, removeMember, updateMemberColor, confirmedSlots, fetchConfirmedSlots, setConfirmedSlots } = useRoomStore();
  const { user } = useAuthStore();
  const { events, deleteEvent } = useWeekedualeStore();

  const room = rooms.find((r) => r.id === id);

  const [tab,              setTab]              = useState<Tab>("overlap");
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [confirmed,        setConfirmed]        = useState<{ label: string } | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [inviteOpen,       setInviteOpen]       = useState(false);

  // 룸 진입 시 확정 슬롯 로드
  useEffect(() => {
    if (id) fetchConfirmedSlots(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const hex = getRoomColorHex(room.color);

  const handleDeleteConfirmed = () => {
    deleteRoom(room.id);
    router.push("/rooms");
  };

  const handleConfirmSchedule = async (
    newSlots: { dayOfWeek: number; startTime: string; endTime: string }[],
    cancelSlotIds: string[]
  ) => {
    if (!room) return;
    if (newSlots.length === 0 && cancelSlotIds.length === 0) return;

    // 1) DB에 추가/취소 반영 (단일 POST로 처리)
    const res = await fetch(`/api/rooms/${room.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: newSlots, cancelIds: cancelSlotIds }),
    });
    if (res.ok) {
      const data = await res.json();
      // 서버에서 반환된 최신 전체 슬롯으로 스토어 교체
      const all = (data.slots ?? []).map((s: any) => ({
        ...s,
        createdAt: typeof s.createdAt === "string" ? s.createdAt : new Date(s.createdAt).toISOString(),
      }));
      setConfirmedSlots(room.id, all);
    }

    // 2) 새 슬롯 → 로그인 유저 개인 시간표에 CalendarEvent 생성
    if (user && newSlots.length > 0) {
      await Promise.all(
        newSlots.map((s) =>
          fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: `${room.name} 미팅`,
              description: `룸 미팅: ${room.name}`,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              category: "meeting",
            }),
          })
        )
      );
    }

    // 3) 취소된 슬롯 → 개인 시간표에서 일치하는 CalendarEvent 삭제
    if (cancelSlotIds.length > 0) {
      const cancelledSlots = (confirmedSlots[room.id] ?? []).filter((s) =>
        cancelSlotIds.includes(s.id)
      );
      for (const slot of cancelledSlots) {
        // dayOfWeek + startTime + endTime이 같은 개인 이벤트 찾아 삭제
        const matched = events.filter(
          (e) =>
            e.dayOfWeek === slot.dayOfWeek &&
            e.startTime === slot.startTime &&
            e.endTime   === slot.endTime
        );
        await Promise.all(matched.map((e) => deleteEvent(e.id)));
      }
    }

    // 4) 토스트 표시
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    const parts: string[] = [];
    if (newSlots.length > 0) {
      parts.push(
        newSlots.length === 1
          ? `${days[newSlots[0].dayOfWeek]}요일 ${newSlots[0].startTime} 확정`
          : `${newSlots.length}개 슬롯 확정`
      );
    }
    if (cancelSlotIds.length > 0) {
      parts.push(`${cancelSlotIds.length}개 슬롯 취소`);
    }
    setConfirmed({ label: parts.join(" · ") + "되었어요!" });
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

        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: hexToRgba(hex, 0.15), color: hex }}
        >
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
                confirmedSlots={confirmedSlots[room.id] ?? []}
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
                onClick={() => setShowDeleteModal(true)}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold transition-all text-left border border-error/30 text-error hover:bg-error/5"
              >
                🗑 Room 삭제
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-surface-container-lowest rounded-3xl p-6 max-w-sm w-full shadow-ambient">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3
              className="text-lg font-bold text-on-surface mb-2 text-center"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              정말 삭제하시겠습니까?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 text-center leading-relaxed">
              <span className="font-semibold text-on-surface">{room.name}</span>을 삭제하면<br />
              멤버들의 일정 공유도 종료됩니다. 이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                아니요
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="flex-1 py-2.5 rounded-full bg-error text-on-error text-sm font-bold transition-all active:scale-95"
              >
                예, 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스케줄 확정 토스트 */}
      {confirmed && (
        <div className="fixed bottom-6 right-6 z-[60] bg-on-surface text-inverse-on-surface px-5 py-3 rounded-2xl text-sm font-semibold shadow-ambient flex items-center gap-3">
          <span className="text-[#4ade80]">✓</span>
          {confirmed.label}
        </div>
      )}

      {/* 초대 모달 */}
      {inviteOpen && (
        <InviteModal roomId={room.id} onClose={() => setInviteOpen(false)} />
      )}
    </>
  );
}
