"use client";

import { useState, useMemo } from "react";
import { RoomMember, getMemberStyle, getHeatStyle, HEATMAP_COLOR_OPTIONS } from "@/types/room";
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

// ── 컴포넌트 ──────────────────────────────────────────────────
interface ScheduleOverlapProps {
  members: RoomMember[];
  heatmapColor?: string;
  onConfirm?: (slot: { dayOfWeek: number; startTime: string; endTime: string; busyMembers: string[] }) => void;
}

export default function ScheduleOverlap({ members, heatmapColor = "blue", onConfirm }: ScheduleOverlapProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.id))
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const activeCount = activeIds.size;

  // 선택된 슬롯 정보
  const selectedSlot = useMemo(() => {
    if (!selectedKey) return null;
    const [day, hour] = selectedKey.split("-").map(Number);
    const busy = getBusyMembers(members, activeIds, day, hour);
    const free = members.filter((m) => activeIds.has(m.id) && !busy.includes(m));
    return { day, hour, busy, free };
  }, [selectedKey, members, activeIds]);

  const toggleMember = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    const { day, hour, busy } = selectedSlot;
    onConfirm?.({
      dayOfWeek: day,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime:   `${String(hour + 1).padStart(2, "0")}:00`,
      busyMembers: busy.map((m) => m.name),
    });
    setSelectedKey(null);
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
          <p className="text-[9px] text-on-surface-variant text-center">
            색이 진할수록 많은 멤버가 바빠요
          </p>
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
                  const isSelected = selectedKey === key;
                  const isWeekend  = dayIdx >= 5;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedKey(isSelected ? null : key)}
                      title={
                        busyList.length > 0
                          ? `바쁜 멤버: ${busyList.map((m) => m.name).join(", ")}`
                          : "전원 가능"
                      }
                      style={ratio > 0 ? getHeatStyle(ratio, heatmapColor) : undefined}
                      className={[
                        "relative h-10 rounded-xl transition-all duration-150 group",
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-105 z-10"
                          : "hover:scale-[1.06] hover:z-10",
                        ratio === 0
                          ? isWeekend
                            ? "bg-surface-dim/20"
                            : "bg-surface-container"
                          : "",
                      ].join(" ")}
                    >
                      {/* busy 카운트 hover */}
                      {busyList.length > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {busyList.length}/{activeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 하단 플로팅 바 ── */}
      {selectedSlot && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-10rem)] max-w-3xl z-50">
          <div className="glass-nav rounded-3xl px-5 py-4 flex items-center justify-between gap-4 border border-white/30 shadow-ambient">
            {/* 시간 정보 */}
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
                  {DAY_LABELS[selectedSlot.day]}요일&nbsp;
                  {String(selectedSlot.hour).padStart(2, "0")}:00 – {String(selectedSlot.hour + 1).padStart(2, "0")}:00
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {selectedSlot.free.length}명 가능 · {selectedSlot.busy.length}명 바쁨
                </p>
              </div>
            </div>

            {/* 멤버 칩 목록 */}
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto px-2 min-w-0">
              {selectedSlot.free.map((m) => (
                <div
                  key={m.id}
                  style={getMemberStyle(m.colorId)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold shrink-0"
                >
                  {m.name}
                </div>
              ))}

              {selectedSlot.busy.length > 0 && (
                <>
                  {selectedSlot.free.length > 0 && (
                    <div className="w-px h-5 bg-outline-variant/40 shrink-0 mx-0.5" />
                  )}
                  {selectedSlot.busy.map((m) => (
                    <div
                      key={m.id}
                      style={getMemberStyle(m.colorId)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold shrink-0 opacity-35"
                    >
                      <span className="line-through">{m.name}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedKey(null)}
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
