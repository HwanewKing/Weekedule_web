"use client";

import { CalendarEvent, DAY_LABELS, timeToMinutes } from "@/types/event";
import EventCard from "./EventCard";

const HOUR_START = 8;
const HOUR_END = 24;
const SLOT_HEIGHT_PX = 64;

const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

interface WeekGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

// ── 겹치는 이벤트 레이아웃 계산 ─────────────────────────────────
interface EventLayout {
  event: CalendarEvent;
  col: number;       // 0-based 열 인덱스
  totalCols: number; // 해당 이벤트의 겹침 그룹 내 열 수
}

function computeOverlapLayout(events: CalendarEvent[]): EventLayout[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const d = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return d !== 0 ? d : timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  // 각 이벤트를 빈 열에 배치 (열 끝 시간 추적)
  const colEnds: number[] = []; // colEnds[i] = 열 i의 마지막 이벤트 종료 시간(분)
  const assigned: { event: CalendarEvent; col: number }[] = [];

  for (const event of sorted) {
    const startMin = timeToMinutes(event.startTime);
    const endMin   = timeToMinutes(event.endTime);
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= startMin) {
        colEnds[c] = endMin;
        assigned.push({ event, col: c });
        placed = true;
        break;
      }
    }
    if (!placed) {
      colEnds.push(endMin);
      assigned.push({ event, col: colEnds.length - 1 });
    }
  }

  // 각 이벤트별로 동시간대 겹치는 이벤트 중 최대 열 수 계산
  return assigned.map(({ event, col }) => {
    const s = timeToMinutes(event.startTime);
    const e = timeToMinutes(event.endTime);
    const maxCol = assigned
      .filter(({ event: o }) => {
        const os = timeToMinutes(o.startTime);
        const oe = timeToMinutes(o.endTime);
        return os < e && oe > s;
      })
      .reduce((max, { col: c }) => Math.max(max, c), 0);
    return { event, col, totalCols: maxCol + 1 };
  });
}

export default function WeekGrid({ events, onEventClick }: WeekGridProps) {
  const getEventsForDay = (dayIndex: number) =>
    events.filter((e) => e.dayOfWeek === dayIndex);

  function getDayLabelColor(i: number): string {
    if (i === 5) return "#2a4dd7";
    if (i === 6) return "#e11d48";
    return "var(--color-on-surface)";
  }

  return (
    <div className="bg-surface-container-low rounded-3xl p-5 overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Day headers */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] mb-2">
          <div />
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="text-center pb-3">
              <p
                className="text-sm font-extrabold tracking-wide"
                style={{ fontFamily: "var(--font-manrope)", color: getDayLabelColor(i) }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative">
          {/* Hour rows */}
          {HOURS.map((hour, rowIdx) => (
            <div
              key={hour}
              className="grid grid-cols-[56px_repeat(7,1fr)]"
              style={{ height: SLOT_HEIGHT_PX }}
            >
              <div className="flex items-start justify-end pr-3 -mt-2.5">
                <span className="text-[10px] font-semibold text-on-surface-variant tabular-nums">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
              {DAY_LABELS.map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={[
                    "border-t border-outline-variant/10",
                    colIdx > 0 ? "border-l border-outline-variant/10" : "",
                    colIdx >= 5 ? "bg-surface-dim/20" : "",
                    rowIdx === HOURS.length - 1 ? "border-b border-outline-variant/10" : "",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}

          {/* Event cards overlay */}
          <div className="absolute inset-0 grid grid-cols-[56px_repeat(7,1fr)] pointer-events-none">
            <div />
            {DAY_LABELS.map((_, colIdx) => {
              const layouts = computeOverlapLayout(getEventsForDay(colIdx));
              return (
                <div key={colIdx} className="relative pointer-events-auto">
                  {layouts.map(({ event, col, totalCols }) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      col={col}
                      totalCols={totalCols}
                      slotHeightPx={SLOT_HEIGHT_PX}
                      hourStart={HOUR_START}
                      onClick={onEventClick}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
