"use client";

import { useState } from "react";
import { CalendarEvent, timeToMinutes } from "@/types/event";
import { useCategoryStore, getCategoryStyle } from "@/lib/categoryStore";

interface BottomWidgetsProps {
  events: CalendarEvent[];
  weeklyGoal: string;
  onGoalSave: (text: string) => void;
}

const WEEKLY_CAPACITY_MINUTES = 40 * 60; // 40시간

export default function BottomWidgets({ events, weeklyGoal, onGoalSave }: BottomWidgetsProps) {
  const [editing, setEditing] = useState(false);
  const [goalText, setGoalText] = useState(weeklyGoal);

  const { categories } = useCategoryStore();

  // 휴식 카테고리 ID 목록 (label이 "휴식"이거나 id가 "break")
  const breakIds = categories
    .filter((c) => c.id === "break" || c.label === "휴식")
    .map((c) => c.id);

  // 총 스케줄 시간 (휴식 제외)
  const totalMin = events
    .filter((e) => !breakIds.includes(e.category))
    .reduce((acc, e) => acc + timeToMinutes(e.endTime) - timeToMinutes(e.startTime), 0);

  const capacityPct = Math.min(Math.round((totalMin / WEEKLY_CAPACITY_MINUTES) * 100), 100);

  // 카테고리별 합산 (휴식 제외, 실제 시간 있는 것만)
  const categoryTotals = categories
    .filter((c) => !breakIds.includes(c.id))
    .map((c) => {
      const mins = events
        .filter((e) => e.category === c.id)
        .reduce((acc, e) => acc + timeToMinutes(e.endTime) - timeToMinutes(e.startTime), 0);
      return { cat: c, mins };
    })
    .filter((x) => x.mins > 0);

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="grid grid-cols-3 gap-5 mt-6">
      {/* Weekly Goal */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-tertiary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </span>
            <h5 className="text-sm font-bold text-on-surface">Weekly Goal</h5>
          </div>
          <button
            onClick={() => {
              if (editing) onGoalSave(goalText);
              setEditing(!editing);
            }}
            className="text-[10px] text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            {editing ? "저장" : "편집"}
          </button>
        </div>
        {editing ? (
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            className="w-full text-sm text-on-surface-variant leading-relaxed bg-surface-container-low rounded-xl p-2 resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            rows={3}
            autoFocus
          />
        ) : (
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {weeklyGoal || "이번 주 목표를 설정해보세요."}
          </p>
        )}
      </div>

      {/* Time Capacity */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </span>
          <h5 className="text-sm font-bold text-on-surface">Time Capacity</h5>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-on-surface-variant mb-1.5">
            <span>주간 스케줄</span>
            <span className="font-bold text-primary">{capacityPct}%</span>
          </div>
          <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-on-surface-variant mb-3">
          {formatHours(totalMin)} / 40h 스케줄됨
        </p>

        <div className="flex flex-wrap gap-1.5">
          {categoryTotals.map(({ cat, mins }) => {
            const styles = getCategoryStyle(cat.color);
            return (
              <span
                key={cat.id}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: styles.bg, color: styles.text }}
              >
                {cat.label} {formatHours(mins)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div
        className="rounded-3xl p-5 text-on-primary flex flex-col justify-between"
        style={{ background: "linear-gradient(135deg, #2a4dd7 0%, #4868f1 100%)" }}
      >
        <div>
          <h5 className="text-sm font-bold opacity-90">이번 주 요약</h5>
          <p
            className="text-3xl font-extrabold mt-2 leading-none"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {events.length}
            <span className="text-base font-semibold opacity-75 ml-1">개</span>
          </p>
          <p className="text-xs opacity-70 mt-1">등록된 일정</p>
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
