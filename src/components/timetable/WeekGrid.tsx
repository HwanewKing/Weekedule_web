"use client";

import { CalendarEvent, timeToMinutes } from "@/types/event";
import { useSettingsStore } from "@/lib/settingsStore";
import EventCard from "./EventCard";

const SLOT_HEIGHT_PX = 64;

const ALL_DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
// dayOfWeek 0=월 … 6=일

interface WeekGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

interface EventLayout {
  event: CalendarEvent;
  col: number;
  totalCols: number;
}

function computeOverlapLayout(events: CalendarEvent[]): EventLayout[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const d = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return d !== 0 ? d : timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  const colEnds: number[] = [];
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
  const { gridStart, gridEnd, showWeekends, startOfWeek } = useSettingsStore();

  // 표시할 요일 인덱스 목록 (0=월 … 6=일), startOfWeek 반영
  const baseDays = startOfWeek === "sun"
    ? [6, 0, 1, 2, 3, 4, 5]   // 일~토
    : [0, 1, 2, 3, 4, 5, 6];  // 월~일

  const visibleDays = showWeekends ? baseDays : baseDays.filter((d) => d !== 5 && d !== 6);

  // 시간 행 배열
  const hours = Array.from({ length: gridEnd - gridStart }, (_, i) => gridStart + i);

  function getDayLabelColor(dayIndex: number): string {
    if (dayIndex === 5) return "#2a4dd7"; // 토
    if (dayIndex === 6) return "#e11d48"; // 일
    return "var(--color-on-surface)";
  }

  const colCount = visibleDays.length;

  return (
    <div className="bg-surface-container-low rounded-3xl p-5 overflow-x-auto">
      <div style={{ minWidth: `${56 + colCount * 80}px` }}>
        {/* Day headers */}
        <div className="grid mb-2" style={{ gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}>
          <div />
          {visibleDays.map((dayIdx) => (
            <div key={dayIdx} className="text-center pb-3">
              <p
                className="text-sm font-extrabold tracking-wide"
                style={{ fontFamily: "var(--font-manrope)", color: getDayLabelColor(dayIdx) }}
              >
                {ALL_DAY_LABELS[dayIdx]}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative">
          {/* Hour rows */}
          {hours.map((hour, rowIdx) => (
            <div
              key={hour}
              className="grid"
              style={{ height: SLOT_HEIGHT_PX, gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}
            >
              <div className="flex items-start justify-end pr-3 -mt-2.5">
                <span className="text-[10px] font-semibold text-on-surface-variant tabular-nums">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
              {visibleDays.map((dayIdx, colIdx) => (
                <div
                  key={dayIdx}
                  className={[
                    "border-t border-outline-variant/10",
                    colIdx > 0 ? "border-l border-outline-variant/10" : "",
                    dayIdx >= 5 ? "bg-surface-dim/20" : "",
                    rowIdx === hours.length - 1 ? "border-b border-outline-variant/10" : "",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}

          {/* Event cards overlay */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{ gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}
          >
            <div />
            {visibleDays.map((dayIdx) => {
              const dayEvents = events.filter((e) => e.dayOfWeek === dayIdx);
              const layouts = computeOverlapLayout(dayEvents);
              return (
                <div key={dayIdx} className="relative pointer-events-auto">
                  {layouts.map(({ event, col, totalCols }) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      col={col}
                      totalCols={totalCols}
                      slotHeightPx={SLOT_HEIGHT_PX}
                      hourStart={gridStart}
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
