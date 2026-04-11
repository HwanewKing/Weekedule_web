"use client";

import { useState } from "react";
import { useWeekedualeStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settingsStore";
import WeekGrid from "@/components/timetable/WeekGrid";
import BottomWidgets from "@/components/timetable/BottomWidgets";
import EventModal from "@/components/timetable/EventModal";
import { CalendarEvent } from "@/types/event";

const T = {
  ko: { nav: "Weekly Timetable", addEvent: "Add Event", title: "이번 주 시간표", subtitle: "일정을 클릭하면 수정하거나 삭제할 수 있어요" },
  en: { nav: "Weekly Timetable", addEvent: "Add Event", title: "This Week", subtitle: "Click an event to edit or delete it" },
} as const;

export default function TimetablePage() {
  const { events, weeklyGoal, addEvent, updateEvent, deleteEvent, deleteGroup, setWeeklyGoal } =
    useWeekedualeStore();
  const { language } = useSettingsStore();
  const t = T[language];

  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTarget,   setEditTarget]   = useState<CalendarEvent | null>(null);
  const [editTargets,  setEditTargets]  = useState<CalendarEvent[] | null>(null);

  const openAdd  = () => { setEditTarget(null); setEditTargets(null); setModalOpen(true); };
  const openEdit = (event: CalendarEvent) => {
    if (event.groupId) {
      // 그룹 이벤트: 같은 groupId를 가진 모든 이벤트를 묶어서 편집
      const group = events.filter((e) => e.groupId === event.groupId);
      setEditTargets(group);
      setEditTarget(null);
    } else {
      setEditTarget(event);
      setEditTargets(null);
    }
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setEditTargets(null); };

  const handleSave = (newEvents: Omit<CalendarEvent, "id">[], groupId?: string) => {
    if (editTargets) {
      // 그룹 편집: 기존 이벤트 전체 삭제 후 새 슬롯으로 재생성
      editTargets.forEach((e) => deleteEvent(e.id));
      // 슬롯이 2개 이상이면 groupId 유지, 1개면 그룹 해제
      const gid = newEvents.length > 1 ? (groupId ?? crypto.randomUUID()) : undefined;
      newEvents.forEach((e) => addEvent({ ...e, groupId: gid }));
    } else if (editTarget) {
      if (newEvents.length === 1) {
        // 단일 이벤트 수정
        updateEvent(editTarget.id, newEvents[0]);
      } else {
        // 슬롯을 추가해 그룹으로 확장 → 기존 이벤트 삭제 후 그룹 재생성
        deleteEvent(editTarget.id);
        const gid = crypto.randomUUID();
        newEvents.forEach((e) => addEvent({ ...e, groupId: gid }));
      }
    } else {
      // 신규: 슬롯이 2개 이상이면 공통 groupId 생성
      const gid = newEvents.length > 1 ? crypto.randomUUID() : undefined;
      newEvents.forEach((e) => addEvent({ ...e, groupId: gid }));
    }
  };

  return (
    <>
      {/* Topbar */}
      <header className="glass-nav border-b border-outline-variant/10 px-8 py-3 flex items-center justify-between shrink-0 z-30">
        <h2
          className="text-base font-bold text-on-surface"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {t.nav}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="px-5 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t.addEvent}
          </button>
        </div>
      </header>

      {/* Page header */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h3
          className="text-4xl font-extrabold text-on-surface tracking-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {t.title}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <WeekGrid events={events} onEventClick={openEdit} />
        <BottomWidgets
          events={events}
          weeklyGoal={weeklyGoal}
          onGoalSave={setWeeklyGoal}
        />
      </main>

      {/* Add / Edit Modal */}
      <EventModal
        open={modalOpen}
        editEvent={editTarget}
        editEvents={editTargets}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={deleteEvent}
        onDeleteGroup={deleteGroup}
      />
    </>
  );
}
