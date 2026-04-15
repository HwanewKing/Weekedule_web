"use client";

import type { MouseEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import { timeToMinutes, type CalendarEvent } from "@/types/event";
import {
  getHeatStyle,
  getMemberStyle,
  type ConfirmedSlot,
  type RoomMember,
} from "@/types/room";

const T = {
  ko: {
    selectedMembers: "Selected Members",
    heatmapLegend: "Heatmap Legend",
    free: "Free",
    busy: "Busy",
    confirmedSlot: "Confirmed Slot",
    available: "Available",
    busyLabel: "Busy",
    noMembers: "No member info",
    addAndCancel: (addCount: number, cancelCount: number) =>
      `${addCount} add / ${cancelCount} cancel`,
    slotSelected: (count: number) =>
      `${count} slot${count !== 1 ? "s" : ""} selected`,
    cancelPending: (count: number) =>
      `${count} slot${count !== 1 ? "s" : ""} pending cancel`,
    allAvailable: "All available:",
    noCommon: "No common available members.",
    cancellingConfirmed: "Confirmed slots will be cancelled.",
    cancel: "Cancel",
    confirm: "Confirm",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  en: {
    selectedMembers: "Selected Members",
    heatmapLegend: "Heatmap Legend",
    free: "Free",
    busy: "Busy",
    confirmedSlot: "Confirmed Slot",
    available: "Available",
    busyLabel: "Busy",
    noMembers: "No member info",
    addAndCancel: (addCount: number, cancelCount: number) =>
      `${addCount} add / ${cancelCount} cancel`,
    slotSelected: (count: number) =>
      `${count} slot${count !== 1 ? "s" : ""} selected`,
    cancelPending: (count: number) =>
      `${count} slot${count !== 1 ? "s" : ""} pending cancel`,
    allAvailable: "All available:",
    noCommon: "No common available members.",
    cancellingConfirmed: "Confirmed slots will be cancelled.",
    cancel: "Cancel",
    confirm: "Confirm",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
} as const;

const HOUR_START = 8;
const HOUR_END = 22;
const SLOT_MIN = 60;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, index) => HOUR_START + index);

function slotKey(day: number, hour: number) {
  return `${day}-${hour}`;
}

function isEventInSlot(event: CalendarEvent, day: number, hour: number): boolean {
  if (event.dayOfWeek !== day) return false;
  const slotStart = hour * 60;
  const slotEnd = slotStart + SLOT_MIN;
  const eventStart = timeToMinutes(event.startTime);
  const eventEnd = timeToMinutes(event.endTime);
  return eventStart < slotEnd && eventEnd > slotStart;
}

function getBusyMembers(
  members: RoomMember[],
  activeIds: Set<string>,
  day: number,
  hour: number
): RoomMember[] {
  return members.filter(
    (member) => activeIds.has(member.id) && member.events.some((event) => isEventInSlot(event, day, hour))
  );
}

interface ScheduleOverlapProps {
  members: RoomMember[];
  heatmapColor?: string;
  confirmedSlots?: ConfirmedSlot[];
  onConfirm?: (
    newSlots: { dayOfWeek: number; startTime: string; endTime: string }[],
    cancelSlotIds: string[]
  ) => void;
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

export default function ScheduleOverlap({
  members,
  heatmapColor = "blue",
  confirmedSlots = [],
  onConfirm,
}: ScheduleOverlapProps) {
  const { language } = useSettingsStore();
  const t = T[language];

  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(members.map((member) => member.id)));
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [cancellingKeys, setCancellingKeys] = useState<Set<string>>(() => new Set());
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const activeCount = activeIds.size;

  const { confirmedKeySet, confirmedIdByKey } = useMemo(() => {
    const keySet = new Set<string>();
    const idMap = new Map<string, string>();

    for (const slot of confirmedSlots) {
      const hour = parseInt(slot.startTime.split(":")[0], 10);
      const key = slotKey(slot.dayOfWeek, hour);
      keySet.add(key);
      idMap.set(key, slot.id);
    }

    return { confirmedKeySet: keySet, confirmedIdByKey: idMap };
  }, [confirmedSlots]);

  const selectedSlots = useMemo(() => {
    return [...selectedKeys].map((key) => {
      const [day, hour] = key.split("-").map(Number);
      const busy = getBusyMembers(members, activeIds, day, hour);
      const free = members.filter((member) => activeIds.has(member.id) && !busy.includes(member));
      return { key, day, hour, busy, free };
    });
  }, [selectedKeys, members, activeIds]);

  const commonFreeMembers = useMemo(() => {
    if (selectedSlots.length === 0) return [];
    const freeIdSets = selectedSlots.map((slot) => new Set(slot.free.map((member) => member.id)));
    const intersection = [...freeIdSets[0]].filter((id) => freeIdSets.every((set) => set.has(id)));
    return members.filter((member) => intersection.includes(member.id));
  }, [selectedSlots, members]);

  const toggleMember = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSlotClick = useCallback((key: string, isConfirmed: boolean) => {
    if (isConfirmed) {
      setCancellingKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } else {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }
  }, []);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLButtonElement>, day: number, hour: number) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const busy = getBusyMembers(members, activeIds, day, hour);
      const free = members.filter((member) => activeIds.has(member.id) && !busy.includes(member));
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

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleConfirm = () => {
    if (selectedKeys.size === 0 && cancellingKeys.size === 0) return;

    const newSlots = selectedSlots.map(({ day, hour }) => ({
      dayOfWeek: day,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
    }));

    const cancelSlotIds = [...cancellingKeys]
      .map((key) => confirmedIdByKey.get(key))
      .filter(Boolean) as string[];

    onConfirm?.(newSlots, cancelSlotIds);
    setSelectedKeys(new Set());
    setCancellingKeys(new Set());
  };

  const summary = [
    ...selectedSlots.map((slot) => `+${t.days[slot.day]} ${String(slot.hour).padStart(2, "0")}:00`),
    ...[...cancellingKeys].map((key) => {
      const [day, hour] = key.split("-").map(Number);
      return `-${t.days[day]} ${String(hour).padStart(2, "0")}:00`;
    }),
  ].join("  ");

  return (
    <div className="flex flex-col gap-6 pb-32 md:pb-28">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl bg-surface-container-low p-5 md:col-span-3">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {t.selectedMembers}
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const active = activeIds.has(member.id);
              const style = getMemberStyle(member.colorId);
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  style={style}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                    active ? "opacity-100 ring-2 ring-current/30" : "opacity-30 hover:opacity-60"
                  }`}
                >
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl bg-surface-container-low p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {t.heatmapLegend}
          </p>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="w-7 text-[9px] text-on-surface-variant">{t.free}</span>
            {[0, 0.1, 0.3, 0.6, 0.9].map((ratio, index) => (
              <div
                key={index}
                className="h-4 flex-1 rounded-md bg-surface-container"
                style={getHeatStyle(ratio, heatmapColor)}
              />
            ))}
            <span className="w-7 text-right text-[9px] text-on-surface-variant">{t.busy}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-4 w-8 items-center justify-center rounded-md bg-surface-container ring-[3px] ring-green-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[9px] text-on-surface-variant">{t.confirmedSlot}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-surface-container-lowest p-4 sm:p-6">
        <div className="min-w-[520px] sm:min-w-[600px]">
          <div className="mb-3 grid grid-cols-[44px_repeat(7,minmax(52px,1fr))] sm:grid-cols-[56px_repeat(7,1fr)]">
            <div />
            {t.days.map((label, index) => (
              <div key={index} className="text-center">
                <span
                  className="text-xs font-extrabold sm:text-sm"
                  style={{
                    fontFamily: "var(--font-manrope)",
                    color:
                      index === 5
                        ? "#2a4dd7"
                        : index === 6
                          ? "#e11d48"
                          : "var(--color-on-surface)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[44px_repeat(7,minmax(52px,1fr))] items-center gap-1 sm:grid-cols-[56px_repeat(7,1fr)] sm:gap-1.5">
                <div className="pr-2 text-right sm:pr-3">
                  <span className="tabular-nums text-[10px] font-semibold text-on-surface-variant">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>

                {t.days.map((_, dayIdx) => {
                  const key = slotKey(dayIdx, hour);
                  const busyList = getBusyMembers(members, activeIds, dayIdx, hour);
                  const ratio = activeCount > 0 ? busyList.length / activeCount : 0;
                  const isSelected = selectedKeys.has(key);
                  const isConfirmed = confirmedKeySet.has(key);
                  const isCancelling = cancellingKeys.has(key);

                  return (
                    <button
                      key={key}
                      onClick={() => handleSlotClick(key, isConfirmed)}
                      onMouseEnter={(event) => handleMouseEnter(event, dayIdx, hour)}
                      onMouseLeave={handleMouseLeave}
                      style={getHeatStyle(ratio, heatmapColor)}
                      className={[
                        "relative h-9 rounded-xl transition-all duration-150 sm:h-10",
                        isSelected
                          ? "z-10 scale-105 ring-[3px] ring-primary ring-offset-2 ring-offset-surface-container-lowest"
                          : isCancelling
                            ? "opacity-60 ring-[3px] ring-red-500 hover:z-10"
                            : isConfirmed
                              ? "ring-[3px] ring-green-500 hover:z-10"
                              : "hover:z-10 hover:scale-[1.06]",
                      ].join(" ")}
                    >
                      {isCancelling ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </span>
                      ) : null}
                      {isConfirmed && !isCancelling ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-[60]"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="min-w-[140px] rounded-2xl bg-on-surface px-3 py-2.5 text-inverse-on-surface shadow-ambient">
            <p className="mb-1.5 text-[11px] font-bold">
              {t.days[tooltip.day]} {String(tooltip.hour).padStart(2, "0")}:00 - {String(tooltip.hour + 1).padStart(2, "0")}:00
            </p>
            {tooltip.free.length > 0 ? (
              <div className="mb-1">
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-green-400">
                  {t.available}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tooltip.free.map((member) => (
                    <span key={member.id} className="text-[10px] font-semibold text-inverse-on-surface/90">
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {tooltip.busy.length > 0 ? (
              <div>
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-400">
                  {t.busyLabel}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tooltip.busy.map((member) => (
                    <span key={member.id} className="text-[10px] font-semibold text-inverse-on-surface/50 line-through">
                      {member.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {tooltip.free.length === 0 && tooltip.busy.length === 0 ? (
              <p className="text-[10px] text-inverse-on-surface/70">{t.noMembers}</p>
            ) : null}
            <div
              className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full"
              style={{
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid var(--color-on-surface)",
              }}
            />
          </div>
        </div>
      ) : null}

      {selectedKeys.size > 0 || cancellingKeys.size > 0 ? (
        <div className="mobile-floating-safe fixed left-4 right-4 z-50 md:left-1/2 md:right-auto md:w-[calc(100%-10rem)] md:max-w-3xl md:-translate-x-1/2">
          <div className="glass-nav flex flex-col gap-4 rounded-3xl border border-white/30 px-4 py-4 shadow-ambient sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight text-on-surface">
                  {selectedKeys.size > 0 && cancellingKeys.size > 0
                    ? t.addAndCancel(selectedKeys.size, cancellingKeys.size)
                    : selectedKeys.size > 0
                      ? t.slotSelected(selectedKeys.size)
                      : t.cancelPending(cancellingKeys.size)}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-on-surface-variant">{summary}</p>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto md:px-2">
              {selectedKeys.size > 0 ? (
                commonFreeMembers.length > 0 ? (
                  <>
                    <span className="shrink-0 text-[10px] text-on-surface-variant">{t.allAvailable}</span>
                    {commonFreeMembers.map((member) => (
                      <div
                        key={member.id}
                        style={getMemberStyle(member.colorId)}
                        className="shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold"
                      >
                        {member.name}
                      </div>
                    ))}
                  </>
                ) : (
                  <span className="text-[10px] text-on-surface-variant">{t.noCommon}</span>
                )
              ) : (
                <span className="text-[10px] font-semibold text-red-400">{t.cancellingConfirmed}</span>
              )}
            </div>

            <div className="flex w-full shrink-0 flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <button
                onClick={() => {
                  setSelectedKeys(new Set());
                  setCancellingKeys(new Set());
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirm}
                className="btn-gradient rounded-xl px-5 py-2 text-sm font-bold text-on-primary transition-all active:scale-95"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
