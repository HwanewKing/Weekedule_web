"use client";

import { CalendarEvent, DAY_LABELS } from "@/types/event";
import EventCard from "./EventCard";

const HOUR_START = 8;
const HOUR_END = 24;
const SLOT_HEIGHT_PX = 64; // px per hour

const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

interface WeekGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function WeekGrid({ events, onEventClick }: WeekGridProps) {
  const isWeekend = (dayIndex: number) => dayIndex >= 5;

  const getEventsForDay = (dayIndex: number) =>
    events.filter((e) => e.dayOfWeek === dayIndex);

  return (
    <div className="bg-surface-container-low rounded-3xl p-5 overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Day headers */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] mb-2">
          <div />
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="text-center pb-3">
              <p
                className={`text-sm font-extrabold tracking-wide ${
                  isWeekend(i) ? "text-on-surface-variant/50" : "text-on-surface"
                }`}
                style={{ fontFamily: "var(--font-manrope)" }}
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
              {/* Time label */}
              <div className="flex items-start justify-end pr-3 -mt-2.5">
                <span className="text-[10px] font-semibold text-on-surface-variant tabular-nums">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>

              {/* Day cells */}
              {DAY_LABELS.map((_, colIdx) => (
                <div
                  key={colIdx}
                  className={[
                    "border-t border-outline-variant/10",
                    colIdx > 0 ? "border-l border-outline-variant/10" : "",
                    isWeekend(colIdx) ? "bg-surface-dim/20" : "",
                    rowIdx === HOURS.length - 1 ? "border-b border-outline-variant/10" : "",
                  ].join(" ")}
                />
              ))}
            </div>
          ))}

          {/* Event cards overlay */}
          <div className="absolute inset-0 grid grid-cols-[56px_repeat(7,1fr)] pointer-events-none">
            <div />
            {DAY_LABELS.map((_, colIdx) => (
              <div key={colIdx} className="relative pointer-events-auto">
                {getEventsForDay(colIdx).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    slotHeightPx={SLOT_HEIGHT_PX}
                    hourStart={HOUR_START}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
