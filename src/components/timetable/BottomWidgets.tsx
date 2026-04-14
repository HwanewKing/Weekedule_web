"use client";

import { useState } from "react";
import { useCategoryStore, getCategoryStyle } from "@/lib/categoryStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { timeToMinutes, type CalendarEvent } from "@/types/event";

interface BottomWidgetsProps {
  events: CalendarEvent[];
  weeklyGoal: string;
  onGoalSave: (text: string) => void;
}

const WEEKLY_CAPACITY_MINUTES = 40 * 60;

export default function BottomWidgets({
  events,
  weeklyGoal,
  onGoalSave,
}: BottomWidgetsProps) {
  const { language } = useSettingsStore();
  const [editing, setEditing] = useState(false);
  const [goalText, setGoalText] = useState(weeklyGoal);
  const { categories } = useCategoryStore();
  const isKorean = language === "ko";

  const breakIds = categories
    .filter((category) => category.id === "break" || category.label === "휴식")
    .map((category) => category.id);

  const totalMin = events
    .filter((event) => !breakIds.includes(event.category))
    .reduce(
      (acc, event) => acc + timeToMinutes(event.endTime) - timeToMinutes(event.startTime),
      0
    );

  const capacityPct = Math.min(
    Math.round((totalMin / WEEKLY_CAPACITY_MINUTES) * 100),
    100
  );

  const categoryTotals = categories
    .filter((category) => !breakIds.includes(category.id))
    .map((category) => {
      const mins = events
        .filter((event) => event.category === category.id)
        .reduce(
          (acc, event) =>
            acc + timeToMinutes(event.endTime) - timeToMinutes(event.startTime),
          0
        );

      return { cat: category, mins };
    })
    .filter((item) => item.mins > 0);

  const formatHours = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    if (isKorean) {
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    }

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-tertiary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </span>
            <h5 className="text-sm font-bold text-on-surface">
              {isKorean ? "주간 목표" : "Weekly Goal"}
            </h5>
          </div>
          <button
            onClick={() => {
              if (editing) {
                onGoalSave(goalText);
              }
              setEditing(!editing);
            }}
            className="text-[10px] font-semibold text-on-surface-variant transition-colors hover:text-primary"
          >
            {editing ? (isKorean ? "저장" : "Save") : (isKorean ? "편집" : "Edit")}
          </button>
        </div>

        {editing ? (
          <textarea
            value={goalText}
            onChange={(event) => setGoalText(event.target.value)}
            className="w-full resize-none rounded-xl bg-surface-container-low p-2 text-sm leading-relaxed text-on-surface-variant outline-none transition-all focus:ring-2 focus:ring-primary/20"
            rows={3}
            autoFocus
          />
        ) : (
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {weeklyGoal || (isKorean ? "이번 주 목표를 설정해 보세요." : "Set a goal for this week.")}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <h5 className="text-sm font-bold text-on-surface">
            {isKorean ? "시간 사용량" : "Time Capacity"}
          </h5>
        </div>

        <div className="mb-3">
          <div className="mb-1.5 flex justify-between text-[10px] text-on-surface-variant">
            <span>{isKorean ? "주간 사용량" : "Weekly load"}</span>
            <span className="font-bold text-primary">{capacityPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-low">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>

        <p className="mb-3 text-[11px] text-on-surface-variant">
          {isKorean
            ? `${formatHours(totalMin)} / 40시간 사용 중`
            : `${formatHours(totalMin)} / 40h used`}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {categoryTotals.map(({ cat, mins }) => {
            const styles = getCategoryStyle(cat.color);
            return (
              <span
                key={cat.id}
                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                style={{ backgroundColor: styles.bg, color: styles.text }}
              >
                {cat.label} {formatHours(mins)}
              </span>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-col justify-between rounded-3xl p-5 text-on-primary md:col-span-2 xl:col-span-1"
        style={{ background: "linear-gradient(135deg, #2a4dd7 0%, #4868f1 100%)" }}
      >
        <div>
          <h5 className="text-sm font-bold opacity-90">
            {isKorean ? "이번 주 요약" : "Weekly Summary"}
          </h5>
          <p
            className="mt-2 text-3xl font-extrabold leading-none"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {events.length}
            <span className="ml-1 text-base font-semibold opacity-75">
              {isKorean ? "개" : ""}
            </span>
          </p>
          <p className="mt-1 text-xs opacity-70">
            {isKorean ? "등록된 일정" : "Scheduled events"}
          </p>
        </div>

        <div className="mt-4 space-y-1.5">
          {categoryTotals.slice(0, 3).map(({ cat, mins }) => (
            <div key={cat.id} className="flex items-center justify-between text-xs opacity-80">
              <span>{cat.label}</span>
              <span className="font-bold">{formatHours(mins)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
