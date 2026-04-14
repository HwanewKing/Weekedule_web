"use client";

import { useEffect, useRef, useState } from "react";
import { PRESET_COLORS, getCategoryStyle, useCategoryStore } from "@/lib/categoryStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { generateTimeOptions, type CalendarEvent } from "@/types/event";

const T = {
  ko: {
    titleNew: "일정 추가",
    titleEdit: "일정 수정",
    titleGroup: (count: number) => `그룹 일정 수정 (${count}개)`,
    subNew: "여러 시간대를 한 번에 추가해 반복 일정처럼 등록할 수 있어요.",
    subEdit: "이 일정을 수정하거나 삭제할 수 있어요.",
    subGroup: "같은 그룹에 속한 일정을 한 번에 편집할 수 있어요.",
    labelTitle: "일정 제목",
    placeholderTitle: "예: 운영체제 수업, 팀 미팅",
    labelCategory: "카테고리",
    addCategory: "추가",
    labelSlots: "요일 및 시간",
    slotCount: (count: number) => `${count}개 시간대`,
    locationPlaceholder: (index: number) => `장소 (선택) ${index + 1}`,
    addSlot: "시간대 추가",
    labelMemo: "메모 (선택)",
    placeholderMemo: "추가 메모를 적어 보세요.",
    btnDelete: "삭제",
    btnDeleteGroup: "전체 삭제",
    btnDeleteConfirm: "정말 삭제",
    btnCancel: "취소",
    btnSave: "저장",
    btnAdd: (count: number) => (count > 1 ? `${count}개 추가` : "추가"),
    btnSaveGroup: (count: number) => `${count}개 저장`,
    catNamePlaceholder: "카테고리 이름",
    catDelete: "삭제",
    catCancel: "취소",
    catSave: "저장",
    catAdd: "추가",
    days: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
  },
  en: {
    titleNew: "Add Event",
    titleEdit: "Edit Event",
    titleGroup: (count: number) => `Edit Group (${count} slots)`,
    subNew: "Add multiple time slots at once for recurring events.",
    subEdit: "Edit or delete this event.",
    subGroup: "Edit all events in this group at once.",
    labelTitle: "Title",
    placeholderTitle: "e.g. OS Lecture, Team Meeting",
    labelCategory: "Category",
    addCategory: "Add",
    labelSlots: "Day & Time",
    slotCount: (count: number) => `${count} slot${count !== 1 ? "s" : ""}`,
    locationPlaceholder: (index: number) => `Location (optional) ${index + 1}`,
    addSlot: "Add Slot",
    labelMemo: "Notes (optional)",
    placeholderMemo: "Add a quick note.",
    btnDelete: "Delete",
    btnDeleteGroup: "Delete All",
    btnDeleteConfirm: "Confirm Delete",
    btnCancel: "Cancel",
    btnSave: "Save",
    btnAdd: (count: number) => (count > 1 ? `Add ${count}` : "Add"),
    btnSaveGroup: (count: number) => `Save ${count} slot${count !== 1 ? "s" : ""}`,
    catNamePlaceholder: "Category name",
    catDelete: "Delete",
    catCancel: "Cancel",
    catSave: "Save",
    catAdd: "Add",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
} as const;

type Lang = keyof typeof T;
type TDict = (typeof T)[Lang];

interface EventModalProps {
  open: boolean;
  editEvent?: CalendarEvent | null;
  editEvents?: CalendarEvent[] | null;
  defaultDay?: number;
  onClose: () => void;
  onSave: (events: Omit<CalendarEvent, "id">[], groupId?: string) => void;
  onDelete?: (id: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

interface TimeSlot {
  _key: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
}

type EventModalContentProps = Omit<EventModalProps, "open">;

interface CategoryPanelProps {
  editId: string | null;
  initialLabel?: string;
  initialColor?: string;
  t: TDict;
  onDone: () => void;
  onDelete?: () => void;
}

const TIME_OPTIONS = generateTimeOptions(8, 24);

function newSlot(defaultDay = 0): TimeSlot {
  return {
    _key: Math.random().toString(36).slice(2),
    dayOfWeek: defaultDay,
    startTime: "09:00",
    endTime: "10:00",
    location: "",
  };
}

function buildInitialState(
  editEvent: CalendarEvent | null | undefined,
  editEvents: CalendarEvent[] | null | undefined,
  defaultDay: number,
  initialCategoryId: string
) {
  if (editEvents && editEvents.length > 0) {
    const first = editEvents[0];

    return {
      title: first.title,
      description: first.description ?? "",
      category: first.category,
      slots: editEvents.map((event) => ({
        _key: event.id,
        dayOfWeek: event.dayOfWeek,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location ?? "",
      })),
    };
  }

  if (editEvent) {
    return {
      title: editEvent.title,
      description: editEvent.description ?? "",
      category: editEvent.category,
      slots: [
        {
          _key: editEvent.id,
          dayOfWeek: editEvent.dayOfWeek,
          startTime: editEvent.startTime,
          endTime: editEvent.endTime,
          location: editEvent.location ?? "",
        },
      ],
    };
  }

  return {
    title: "",
    description: "",
    category: initialCategoryId,
    slots: [newSlot(defaultDay)],
  };
}

function CategoryPanel({
  editId,
  initialLabel = "",
  initialColor = "#4F6CF5",
  t,
  onDone,
  onDelete,
}: CategoryPanelProps) {
  const { addCategory, updateCategory } = useCategoryStore();
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!label.trim()) return;

    if (editId) {
      updateCategory(editId, label.trim(), color);
    } else {
      addCategory(label.trim(), color);
    }

    onDone();
  };

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container p-3">
      <input
        ref={inputRef}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder={t.catNamePlaceholder}
        className="field text-sm"
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSave();
          if (event.key === "Escape") onDone();
        }}
      />
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            onClick={() => setColor(presetColor)}
            className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: presetColor,
              borderColor: color === presetColor ? "#fff" : "transparent",
              boxShadow: color === presetColor ? `0 0 0 2px ${presetColor}` : "none",
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {editId && onDelete ? (
          <button
            onClick={onDelete}
            className="rounded-full border border-error/40 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/5"
          >
            {t.catDelete}
          </button>
        ) : null}
        <button
          onClick={onDone}
          className="flex-1 rounded-full border border-outline-variant py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          {t.catCancel}
        </button>
        <button
          onClick={handleSave}
          disabled={!label.trim()}
          className="flex-1 rounded-full py-1.5 text-xs font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {editId ? t.catSave : t.catAdd}
        </button>
      </div>
    </div>
  );
}

function EventModalContent({
  editEvent,
  editEvents,
  defaultDay = 0,
  onClose,
  onSave,
  onDelete,
  onDeleteGroup,
}: EventModalContentProps) {
  const isEdit = !!(editEvent || editEvents);
  const isGroupEdit = !!(editEvents && editEvents.length > 0);
  const { categories, deleteCategory } = useCategoryStore();
  const { language } = useSettingsStore();
  const t = T[language as Lang] ?? T.ko;

  const initialState = buildInitialState(
    editEvent,
    editEvents,
    defaultDay,
    categories[0]?.id ?? ""
  );

  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [category, setCategory] = useState(initialState.category);
  const [slots, setSlots] = useState<TimeSlot[]>(initialState.slots);
  const [confirmDel, setConfirmDel] = useState(false);
  const [catPanel, setCatPanel] = useState<
    | { mode: "new" }
    | { mode: "edit"; id: string; label: string; color: string }
    | null
  >(null);

  const selectedCategoryId = categories.some((item) => item.id === category)
    ? category
    : (categories[0]?.id ?? "");

  const valid =
    !!title.trim() &&
    !!selectedCategoryId &&
    slots.every((slot) => slot.startTime < slot.endTime);

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      newSlot(prev[prev.length - 1]?.dayOfWeek ?? defaultDay),
    ]);
  };

  const removeSlot = (key: string) => {
    setSlots((prev) => prev.filter((slot) => slot._key !== key));
  };

  const patchSlot = (key: string, patch: Partial<TimeSlot>) => {
    setSlots((prev) =>
      prev.map((slot) => (slot._key === key ? { ...slot, ...patch } : slot))
    );
  };

  const handleSave = () => {
    if (!valid) return;

    const mapped = slots.map((slot) => ({
      title: title.trim(),
      description: description.trim() || undefined,
      category: selectedCategoryId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location.trim() || undefined,
    }));

    if (isGroupEdit && editEvents?.[0]?.groupId) {
      onSave(mapped, editEvents[0].groupId);
    } else {
      onSave(mapped);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!confirmDel) {
      setConfirmDel(true);
      return;
    }

    if (isGroupEdit && editEvents?.[0]?.groupId) {
      onDeleteGroup?.(editEvents[0].groupId);
    } else if (editEvent) {
      onDelete?.(editEvent.id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface-container-lowest shadow-ambient">
        <div className="flex items-start justify-between border-b border-outline-variant/10 px-6 pb-4 pt-6">
          <div>
            <h2
              className="text-xl font-extrabold text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {isGroupEdit ? t.titleGroup(editEvents!.length) : isEdit ? t.titleEdit : t.titleNew}
            </h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {isGroupEdit ? t.subGroup : isEdit ? t.subEdit : t.subNew}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex max-h-[72vh] flex-col gap-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="label-field">{t.labelTitle}</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t.placeholderTitle}
              className="field"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
              }}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label-field mb-0">{t.labelCategory}</label>
              <button
                onClick={() => setCatPanel(catPanel?.mode === "new" ? null : { mode: "new" })}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary transition-opacity hover:opacity-70"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t.addCategory}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => {
                const styles = getCategoryStyle(item.color);
                const selected = selectedCategoryId === item.id;

                return (
                  <div key={item.id} className="group relative">
                    <button
                      onClick={() => {
                        setCategory(item.id);
                        setCatPanel(null);
                      }}
                      className={`rounded-full px-3 py-1.5 pr-7 text-xs font-semibold transition-all ${
                        selected
                          ? ""
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                      style={
                        selected
                          ? {
                              backgroundColor: styles.bg,
                              color: styles.text,
                              outline: `2px solid ${item.color}40`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="mr-1.5 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setCatPanel(
                          catPanel?.mode === "edit" && catPanel.id === item.id
                            ? null
                            : {
                                mode: "edit",
                                id: item.id,
                                label: item.label,
                                color: item.color,
                              }
                        );
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {catPanel?.mode === "new" ? (
              <CategoryPanel editId={null} t={t} onDone={() => setCatPanel(null)} />
            ) : null}

            {catPanel?.mode === "edit" ? (
              <CategoryPanel
                editId={catPanel.id}
                initialLabel={catPanel.label}
                initialColor={catPanel.color}
                t={t}
                onDone={() => setCatPanel(null)}
                onDelete={() => {
                  deleteCategory(catPanel.id);
                  setCatPanel(null);
                }}
              />
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label-field mb-0">{t.labelSlots}</label>
              <span className="text-[10px] text-on-surface-variant">
                {t.slotCount(slots.length)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {slots.map((slot, index) => (
                <div
                  key={slot._key}
                  className="flex flex-col gap-2.5 rounded-2xl bg-surface-container p-3"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(event) =>
                        patchSlot(slot._key, { dayOfWeek: Number(event.target.value) })
                      }
                      className="field min-w-0 flex-1 text-sm"
                    >
                      {t.days.map((day, dayIndex) => (
                        <option key={day} value={dayIndex}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <select
                      value={slot.startTime}
                      onChange={(event) => {
                        const nextStartTime = event.target.value;
                        patchSlot(slot._key, {
                          startTime: nextStartTime,
                          endTime:
                            nextStartTime >= slot.endTime
                              ? TIME_OPTIONS[
                                  Math.min(
                                    TIME_OPTIONS.indexOf(nextStartTime) + 2,
                                    TIME_OPTIONS.length - 1
                                  )
                                ]
                              : slot.endTime,
                        });
                      }}
                      className="field min-w-0 flex-1 text-sm"
                    >
                      {TIME_OPTIONS.slice(0, -1).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <select
                      value={slot.endTime}
                      onChange={(event) => patchSlot(slot._key, { endTime: event.target.value })}
                      className="field min-w-0 flex-1 text-sm"
                    >
                      {TIME_OPTIONS.filter((time) => time > slot.startTime).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    {slots.length > 1 ? (
                      <button
                        onClick={() => removeSlot(slot._key)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    ) : null}
                  </div>

                  <input
                    value={slot.location}
                    onChange={(event) => patchSlot(slot._key, { location: event.target.value })}
                    placeholder={t.locationPlaceholder(index)}
                    className="field text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addSlot}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary transition-opacity hover:opacity-70"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t.addSlot}
            </button>
          </div>

          <div>
            <label className="label-field">{t.labelMemo}</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.placeholderMemo}
              rows={2}
              className="field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-2">
          {isEdit ? (
            <button
              onClick={handleDelete}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                confirmDel
                  ? "bg-error text-on-error"
                  : "border border-error/40 text-error hover:bg-error/5"
              }`}
            >
              {confirmDel ? t.btnDeleteConfirm : isGroupEdit ? t.btnDeleteGroup : t.btnDelete}
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-outline-variant py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {t.btnCancel}
          </button>

          <button
            onClick={handleSave}
            disabled={!valid}
            className="btn-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-on-primary transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGroupEdit
              ? t.btnSaveGroup(slots.length)
              : isEdit
                ? t.btnSave
                : t.btnAdd(slots.length)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventModal({
  open,
  editEvent,
  editEvents,
  defaultDay = 0,
  onClose,
  onSave,
  onDelete,
  onDeleteGroup,
}: EventModalProps) {
  if (!open) return null;

  const modalKey = editEvents?.length
    ? `group:${editEvents.map((event) => event.id).join(",")}`
    : editEvent
      ? `event:${editEvent.id}`
      : `new:${defaultDay}`;

  return (
    <EventModalContent
      key={modalKey}
      editEvent={editEvent}
      editEvents={editEvents}
      defaultDay={defaultDay}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      onDeleteGroup={onDeleteGroup}
    />
  );
}
