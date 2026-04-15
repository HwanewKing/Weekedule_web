"use client";

import { useCategoryStore, getCategoryStyle } from "@/lib/categoryStore";
import { timeToMinutes, type CalendarEvent } from "@/types/event";

interface EventCardProps {
  event: CalendarEvent;
  slotHeightPx: number;
  hourStart: number;
  col: number;
  totalCols: number;
  onClick: (event: CalendarEvent) => void;
}

const PAD = 6;
const GAP = 2;

export default function EventCard({
  event,
  slotHeightPx,
  hourStart,
  col,
  totalCols,
  onClick,
}: EventCardProps) {
  const startMin = timeToMinutes(event.startTime);
  const endMin = timeToMinutes(event.endTime);
  const durationMin = endMin - startMin;

  const topPx = ((startMin - hourStart * 60) / 60) * slotHeightPx;
  const heightPx = (durationMin / 60) * slotHeightPx;

  const { getCategoryById } = useCategoryStore();
  const category = getCategoryById(event.category);
  const color = event.sourceRoomId ? "#0f766e" : category?.color ?? "#9E9E9E";
  const styles = getCategoryStyle(color);

  const leftPct = (col / totalCols) * 100;
  const widthPct = (1 / totalCols) * 100;
  const leftPx = col === 0 ? PAD : GAP;
  const rightPx = col === totalCols - 1 ? PAD : GAP;

  return (
    <div
      className="event-card absolute z-10 cursor-pointer overflow-hidden rounded-xl bg-surface-container-lowest"
      style={{
        top: topPx + 2,
        height: Math.max(heightPx - 4, 24),
        left: `calc(${leftPct}% + ${leftPx}px)`,
        width: `calc(${widthPct}% - ${leftPx + rightPx}px)`,
      }}
      onClick={() => onClick(event)}
    >
      <div
        className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: styles.accent }}
      />

      <div className="flex h-full min-h-0 flex-col px-2 pb-2 pl-3 pt-2">
        <span className="mb-0.5 text-[10px] font-bold leading-none" style={{ color: styles.text }}>
          {event.startTime} - {event.endTime}
        </span>
        <h4 className="line-clamp-2 text-xs font-bold leading-tight text-on-surface">
          {event.title}
        </h4>

        {event.sourceRoomId ? (
          <span
            className="mt-1 inline-flex w-fit rounded-full px-1.5 py-0.5 text-[9px] font-bold"
            style={{ backgroundColor: styles.bg, color: styles.text }}
          >
            ROOM
          </span>
        ) : null}

        {heightPx > 80 && event.description ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-on-surface-variant">
            {event.description}
          </p>
        ) : null}

        {heightPx > 60 && event.location ? (
          <div className="mt-auto flex items-center gap-0.5 text-[10px] text-on-surface-variant">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </div>
        ) : null}

        {heightPx > 70 && event.attendees && event.attendees.length > 0 ? (
          <div className="mt-1 flex -space-x-1.5">
            {event.attendees.slice(0, 3).map((name, index) => (
              <div
                key={index}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-surface bg-primary-fixed text-[7px] font-bold text-primary"
                title={name}
              >
                {name[0]}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
