"use client";

import { useSettingsStore } from "@/lib/settingsStore";
import type { CalendarEvent } from "@/types/event";
import EventCard from "./EventCard";

const SLOT_HEIGHT_PX = 64;
const DAY_LABELS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

interface EventLayout {
  event: CalendarEvent;
  col: number;
  totalCols: number;
}

function canMergeRoomEvents(current: CalendarEvent, next: CalendarEvent): boolean {
  return (
    !!current.sourceRoomId &&
    current.sourceRoomId === next.sourceRoomId &&
    current.title === next.title &&
    current.dayOfWeek === next.dayOfWeek &&
    current.endTime === next.startTime
  );
}

function mergeRoomEventsForDisplay(events: CalendarEvent[]): CalendarEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (startDiff !== 0) return startDiff;

    const endDiff = timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
    if (endDiff !== 0) return endDiff;

    return a.id.localeCompare(b.id);
  });

  const merged: CalendarEvent[] = [];

  for (const event of sorted) {
    const last = merged[merged.length - 1];

    if (last && canMergeRoomEvents(last, event)) {
      merged[merged.length - 1] = {
        ...last,
        id: `${last.id}__${event.id}`,
        endTime: event.endTime,
        sourceConfirmedSlotId: undefined,
      };
      continue;
    }

    merged.push(event);
  }

  return merged;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function computeOverlapLayout(events: CalendarEvent[]): EventLayout[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return diff !== 0 ? diff : timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  const colEnds: number[] = [];
  const assigned: { event: CalendarEvent; col: number }[] = [];

  for (const event of sorted) {
    const startMin = timeToMinutes(event.startTime);
    const endMin = timeToMinutes(event.endTime);
    let placed = false;

    for (let col = 0; col < colEnds.length; col += 1) {
      if (colEnds[col] <= startMin) {
        colEnds[col] = endMin;
        assigned.push({ event, col });
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
    const start = timeToMinutes(event.startTime);
    const end = timeToMinutes(event.endTime);
    const maxCol = assigned
      .filter(({ event: other }) => {
        const otherStart = timeToMinutes(other.startTime);
        const otherEnd = timeToMinutes(other.endTime);
        return otherStart < end && otherEnd > start;
      })
      .reduce((max, { col: nextCol }) => Math.max(max, nextCol), 0);

    return { event, col, totalCols: maxCol + 1 };
  });
}

export default function WeekGrid({ events, onEventClick }: WeekGridProps) {
  const { gridStart, gridEnd, showWeekends, startOfWeek, language } = useSettingsStore();
  const dayLabels = language === "en" ? DAY_LABELS_EN : DAY_LABELS_KO;

  const baseDays = startOfWeek === "sun"
    ? [6, 0, 1, 2, 3, 4, 5]
    : [0, 1, 2, 3, 4, 5, 6];

  const visibleDays = showWeekends ? baseDays : baseDays.filter((day) => day !== 5 && day !== 6);
  const hours = Array.from({ length: gridEnd - gridStart }, (_, index) => gridStart + index);
  const colCount = visibleDays.length;

  const getDayLabelColor = (dayIndex: number) => {
    if (dayIndex === 5) return "#2a4dd7";
    if (dayIndex === 6) return "#e11d48";
    return "var(--color-on-surface)";
  };

  return (
    <div className="overflow-x-auto rounded-3xl bg-surface-container-low p-3 sm:p-5">
      <div style={{ minWidth: `${56 + colCount * 72}px` }}>
        <div className="mb-2 grid" style={{ gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}>
          <div />
          {visibleDays.map((dayIdx) => (
            <div key={dayIdx} className="pb-3 text-center">
              <p
                className="text-sm font-extrabold tracking-wide"
                style={{
                  fontFamily: "var(--font-manrope)",
                  color: getDayLabelColor(dayIdx),
                }}
              >
                {dayLabels[dayIdx]}
              </p>
            </div>
          ))}
        </div>

        <div className="relative">
          {hours.map((hour, rowIdx) => (
            <div
              key={hour}
              className="grid"
              style={{ height: SLOT_HEIGHT_PX, gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}
            >
              <div className="-mt-2.5 flex items-start justify-end pr-3">
                <span className="tabular-nums text-[10px] font-semibold text-on-surface-variant">
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

          <div
            className="pointer-events-none absolute inset-0 grid"
            style={{ gridTemplateColumns: `56px repeat(${colCount}, 1fr)` }}
          >
            <div />
            {visibleDays.map((dayIdx) => {
              const dayEvents = mergeRoomEventsForDisplay(
                events.filter((event) => event.dayOfWeek === dayIdx)
              );
              const layouts = computeOverlapLayout(dayEvents);

              return (
                <div key={dayIdx} className="pointer-events-auto relative">
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
