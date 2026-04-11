"use client";

import { useState } from "react";
import { useWeekedualeStore } from "@/lib/store";
import WeekGrid from "@/components/timetable/WeekGrid";
import BottomWidgets from "@/components/timetable/BottomWidgets";
import EventModal from "@/components/timetable/EventModal";
import { CalendarEvent } from "@/types/event";

export default function TimetablePage() {
  const { events, weeklyGoal, addEvent, updateEvent, deleteEvent, setWeeklyGoal } =
    useWeekedualeStore();

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<CalendarEvent | null>(null);

  const openAdd  = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (event: CalendarEvent) => { setEditTarget(event); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSave = (data: Omit<CalendarEvent, "id">) => {
    if (editTarget) {
      updateEvent(editTarget.id, data);
    } else {
      addEvent(data);
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
          Weekly Timetable
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="px-5 py-2 rounded-full btn-gradient text-sm font-bold text-on-primary flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Event
          </button>
        </div>
      </header>

      {/* Page header */}
      <div className="px-8 pt-6 pb-4 shrink-0">
        <h3
          className="text-4xl font-extrabold text-on-surface tracking-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          이번 주 시간표
        </h3>
        <p className="text-sm text-on-surface-variant mt-1">
          일정을 클릭하면 수정하거나 삭제할 수 있어요
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
        onClose={closeModal}
        onSave={handleSave}
        onDelete={deleteEvent}
      />
    </>
  );
}
