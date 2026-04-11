"use client";

import { useState, useMemo, useCallback } from "react";
import { RoomMember, ConfirmedSlot, getMemberStyle, getHeatStyle, HEATMAP_COLOR_OPTIONS } from "@/types/room";
import { DAY_LABELS, timeToMinutes } from "@/types/event";
import type { CalendarEvent } from "@/types/event";

// ── 상수 ──────────────────────────────────────────────────────
const HOUR_START = 8;
const HOUR_END   = 22;
const SLOT_MIN   = 60;
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

function slotKey(day: number, hour: number) { return `${day}-${hour}`; }

function isEventInSlot(event: CalendarEvent, day: number, hour: number): boolean {
  if (event.dayOfWeek !== day) return false;
  const slotStart = hour * 60;
  const slotEnd   = slotStart + SLOT_MIN;
  const evStart   = timeToMinutes(event.startTime);
  const evEnd     = timeToMinutes(event.endTime);
  return evStart < slotEnd && evEnd > slotStart;
}

function getBusyMembers(members: RoomMember[], activeIds: Set<string>, day: number, hour: number): RoomMember[] {
  return members.filter(
    (m) => activeIds.has(m.id) && m.events.some((e) => isEventInSlot(e, day, hour))
  );
}

// ── Props ─────────────────────────────────────────────────────
interface ScheduleOverlapProps {
  members: RoomMember[];
  heatmapColor?: string;
  confirmedSlots?: ConfirmedSlot[];
  onConfirm?: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) => void;
}

interface TooltipInfo {
  key: string;
  day: number;
  hour: number;
  x: number;
  y: number;
  busy: RoomMember[];
  free: RoomMember[];
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function ScheduleOverlap({
  members,
  heatmapColor = "blue",
  confirmedSlots = [],
  onConfirm,
}: ScheduleOverlapProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.id))
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const activeCount = activeIds.size;

  // 확정된 슬롯 키 세트
  const confirmedKeySet = useMemo(() => {
    const set = new Set<string>();
    for (const s of confirmedSlots) {
      const hour = parseInt(s.startTime.split(":")[0], 10);
      set.add(slotKey(s.dayOfWeek, hour));
    }
    return set;
  }, [confirmedSlots]);

  // 선택된 슬롯 정보 목록
  const selectedSlots = useMemo(() => {
    return [...selectedKeys].map((key) => {
      const [day, hour] = key.split("-").map(Number);
      const busy = getBusyMembers(members, activeIds, day, hour);
      const free = members.filter((m) => activeIds.has(m.id) && !busy.includes(m));
      return { key, day, hour, busy, free };
    });
  }, [selectedKeys, members, activeIds]);

  // 모든 선택 슬롯에서 공통으로 가능한 멤버 (교집합)
  const commonFreeMembers = useMemo(() => {
    if (selectedSlots.length === 0) return [];
    const freeIdSets = selectedSlots.map((s) => new Set(s.free.map((m) => m.id)));
    const intersection = [...freeIdSets[0]].filter((id) => freeIdSets.every((set) => set.has(id)));
    return members.filter((m) => intersection.includes(m.id));
  }, [selectedSlots, members]);

  const toggleMember = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const handleSlotClick = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, day: number, hour: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const busy = getBusyMembers(members, activeIds, day, hour);
      const free = members.filter((m) => activeIds.has(m.id) && !busy.includes(m));
      setTooltip({
        key: slotKey(day, hour),
        day,
        hour,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        busy,
        free,
      });
    },
    [members, activeIds]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleConfirm = () => {
    if (selectedSlots.length === 0) return;
    const slots = selectedSlots.map(({ day, hour }) => ({
      dayOfWeek: day,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime:   `${String(hour + 1).padStart(2, "0")}:00`,
    }));
    onConfirm?.(slots);
    setSelectedKeys(new Set());
  };

  return (
    <div className="flex flex-col gap-6 pb-28">
      {/* ── 멤버 선택 패널 + 범례 ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-surface-container-low rounded-3xl p-5">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            Selected Members
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const active = activeIds.has(m.id);
              const style = getMemberStyle(m.colorId);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  style={style}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    active ? "opacity-100 ring-2 ring-current/30" : "opacity-30 hover:opacity-60"
                  }`}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 범례 */}
        <div className="bg-surface-container-low rounded-3xl p-5 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
            Heatmap Legend
          </p>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[9px] text-on-surface-variant w-7">Free</span>
            {[0, 0.1, 0.3, 0.6, 0.9].map((ratio, i) => (
              <div
                key={i}
                className="flex-1 h-4 rounded-md bg-surface-container"
                style={ratio > 0 ? getHeatStyle(ratio, heatmapColor) : {}}
              />
            ))}
            <span className="text-[9px] text-on-surface-variant w-7 text-right">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-8 h-4 rounded-md ring-[3px] ring-green-500 bg-surface-container shrink-0 flex items-center justify-end pr-0.5">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <span className="text-[9px] text-on-surface-variant">확정된 슬롯</span>
          </div>
        </div>
      </div>

      {/* ── 히트맵 그리드 ── */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] mb-3">
            <div />
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="text-center">
                <span
                  className="text-sm font-extrabold"
                  style={{
                    fontFamily: "var(--font-manrope)",
                    color: i === 5 ? "#2a4dd7" : i === 6 ? "#e11d48" : "var(--color-on-surface)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* 시간 슬롯 */}
          <div className="flex flex-col gap-1.5">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] gap-1.5 items-center">
                <div className="text-right pr-3">
                  <span className="text-[10px] font-semibold text-on-surface-variant tabular-nums">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>

                {DAY_LABELS.map((_, dayIdx) => {
                  const key        = slotKey(dayIdx, hour);
                  const busyList   = getBusyMembers(members, activeIds, dayIdx, hour);
                  const ratio      = activeCount > 0 ? busyList.length / activeCount : 0;
                  const isSelected = selectedKeys.has(key);
                  const isConfirmed = confirmedKeySet.has(key);
                  const isWeekend  = dayIdx >= 5;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSlotClick(key)}
                      onMouseEnter={(e) => handleMouseEnter(e, dayIdx, hour)}
                      onMouseLeave={handleMouseLeave}
                      style={ratio > 0 ? getHeatStyle(ratio, heatmapColor) : undefined}
                      className={[
                        "relative h-10 rounded-xl transition-all duration-150",
                        isSelected
                          ? "ring-[3px] ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-105 z-10"
                          : isConfirmed
                          ? "ring-[3px] ring-green-500"
                          : "hover:scale-[1.06] hover:z-10",
                        ratio === 0
                          ? isWeekend
                            ? "bg-surface-dim/20"
                            : "bg-surface-container"
                          : "",
                      ].join(" ")}
                    >
                      {/* 확정 도트 — 중앙 우측 배치 */}
                      {isConfirmed && (
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hover 툴팁 ── */}
      {tooltip && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="bg-on-surface text-inverse-on-surface rounded-2xl px-3 py-2.5 shadow-ambient min-w-[140px]">
            <p className="text-[11px] font-bold mb-1.5">
              {DAY_LABELS[tooltip.day]}요일&nbsp;
              {String(tooltip.hour).padStart(2, "0")}:00 – {String(tooltip.hour + 1).padStart(2, "0")}:00
            </p>
            {tooltip.free.length > 0 && (
              <div className="mb-1">
                <p className="text-[9px] font-semibold text-green-400 uppercase tracking-wide mb-0.5">가능</p>
                <div className="flex flex-wrap gap-1">
                  {tooltip.free.map((m) => (
                    <span key={m.id} className="text-[10px] font-semibold text-inverse-on-surface/90">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tooltip.busy.length > 0 && (
              <div>
                <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wide mb-0.5">바쁨</p>
                <div className="flex flex-wrap gap-1">
                  {tooltip.busy.map((m) => (
                    <span key={m.id} className="text-[10px] font-semibold text-inverse-on-surface/50 line-through">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tooltip.free.length === 0 && tooltip.busy.length === 0 && (
              <p className="text-[10px] text-inverse-on-surface/70">멤버 정보 없음</p>
            )}
            {/* 아래 화살표 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
              style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid var(--color-on-surface)" }}
            />
          </div>
        </div>
      )}

      {/* ── 하단 플로팅 바 ── */}
      {selectedKeys.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-10rem)] max-w-3xl z-50">
          <div className="glass-nav rounded-3xl px-5 py-4 flex items-center justify-between gap-4 border border-white/30 shadow-ambient">
            {/* 슬롯 수 정보 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface leading-tight">
                  {selectedKeys.size}개 슬롯 선택됨
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {selectedSlots.map((s) => `${DAY_LABELS[s.day]}${String(s.hour).padStart(2,"0")}:00`).join(", ")}
                </p>
              </div>
            </div>

            {/* 공통 가능 멤버 칩 */}
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto px-2 min-w-0">
              {commonFreeMembers.length > 0 ? (
                <>
                  <span className="text-[10px] text-on-surface-variant shrink-0">전원 가능:</span>
                  {commonFreeMembers.map((m) => (
                    <div
                      key={m.id}
                      style={getMemberStyle(m.colorId)}
                      className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold shrink-0"
                    >
                      {m.name}
                    </div>
                  ))}
                </>
              ) : (
                <span className="text-[10px] text-on-surface-variant">공통으로 가능한 멤버 없음</span>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedKeys(new Set())}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl btn-gradient text-sm font-bold text-on-primary active:scale-95 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
