"use client";

import { CalendarEvent, timeToMinutes } from "@/types/event";
import { useCategoryStore, getCategoryStyle } from "@/lib/categoryStore";

interface EventCardProps {
  event: CalendarEvent;
  slotHeightPx: number;
  hourStart: number;
  onClick: (event: CalendarEvent) => void;
}

export default function EventCard({ event, slotHeightPx, hourStart, onClick }: EventCardProps) {
  const startMin = timeToMinutes(event.startTime);
  const endMin   = timeToMinutes(event.endTime);
  const durationMin = endMin - startMin;

  const topPx    = ((startMin - hourStart * 60) / 60) * slotHeightPx;
  const heightPx = (durationMin / 60) * slotHeightPx;

  const { getCategoryById } = useCategoryStore();
  const cat = getCategoryById(event.category);
  const color = cat?.color ?? "#9E9E9E";
  const styles = getCategoryStyle(color);

  return (
    <div
      className="absolute inset-x-1.5 event-card rounded-xl overflow-hidden cursor-pointer bg-surface-container-lowest z-10"
      style={{ top: topPx + 2, height: Math.max(heightPx - 4, 24) }}
      onClick={() => onClick(event)}
    >
      {/* Left accent pill */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: styles.accent }}
      />

      <div className="pl-3 pr-2 pt-2 pb-2 h-full flex flex-col min-h-0">
        <span
          className="text-[10px] font-bold mb-0.5 leading-none"
          style={{ color: styles.text }}
        >
          {event.startTime} – {event.endTime}
        </span>
        <h4 className="text-xs font-bold text-on-surface leading-tight line-clamp-2">{event.title}</h4>

        {heightPx > 80 && event.description && (
          <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">{event.description}</p>
        )}

        {heightPx > 60 && event.location && (
          <div className="mt-auto flex items-center gap-0.5 text-[10px] text-on-surface-variant">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </div>
        )}

        {heightPx > 70 && event.attendees && event.attendees.length > 0 && (
          <div className="mt-1 flex -space-x-1.5">
            {event.attendees.slice(0, 3).map((name, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-primary-fixed border border-surface flex items-center justify-center text-[7px] font-bold text-primary"
                title={name}
              >
                {name[0]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
