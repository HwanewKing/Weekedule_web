"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarEvent,
  generateTimeOptions,
} from "@/types/event";
import {
  useCategoryStore,
  getCategoryStyle,
  PRESET_COLORS,
} from "@/lib/categoryStore";
import { useSettingsStore } from "@/lib/settingsStore";

// ── i18n ──────────────────────────────────────────────────────────
const T = {
  ko: {
    titleNew:        "새 일정 추가",
    titleEdit:       "일정 편집",
    titleGroup:      (n: number) => `그룹 일정 편집 (${n}개)`,
    subNew:          "요일·시간을 추가해 반복 일정을 한번에 등록하세요",
    subEdit:         "내용을 수정하거나 삭제하세요",
    subGroup:        "함께 등록된 일정을 한번에 수정하세요",
    labelTitle:      "일정 제목",
    placeholderTitle:"예: 운영체제, 팀 미팅...",
    labelCategory:   "카테고리",
    addCategory:     "추가",
    labelSlots:      "요일 & 시간",
    slotCount:       (n: number) => `${n}개 슬롯`,
    locationPlaceholder: (i: number) => `장소 (선택) ${i + 1}`,
    addSlot:         "시간 및 장소 추가",
    labelMemo:       "메모 (선택)",
    placeholderMemo: "추가 메모...",
    btnDelete:       "삭제",
    btnDeleteGroup:  "전체 삭제",
    btnDeleteConfirm:"정말 삭제",
    btnCancel:       "취소",
    btnSave:         "저장",
    btnAdd:          (n: number) => n > 1 ? `${n}개 추가` : "추가",
    btnSaveGroup:    (n: number) => `${n}개 슬롯 저장`,
    catNamePlaceholder: "카테고리 이름...",
    catDelete:       "삭제",
    catCancel:       "취소",
    catSave:         "저장",
    catAdd:          "추가",
    days: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
  },
  en: {
    titleNew:        "Add Event",
    titleEdit:       "Edit Event",
    titleGroup:      (n: number) => `Edit Group (${n} slots)`,
    subNew:          "Add multiple slots to register recurring events at once",
    subEdit:         "Edit or delete this event",
    subGroup:        "Edit all events in this group at once",
    labelTitle:      "Title",
    placeholderTitle:"e.g. OS Lecture, Team Meeting...",
    labelCategory:   "Category",
    addCategory:     "Add",
    labelSlots:      "Day & Time",
    slotCount:       (n: number) => `${n} slot${n !== 1 ? "s" : ""}`,
    locationPlaceholder: (i: number) => `Location (optional) ${i + 1}`,
    addSlot:         "Add time & location",
    labelMemo:       "Notes (optional)",
    placeholderMemo: "Additional notes...",
    btnDelete:       "Delete",
    btnDeleteGroup:  "Delete All",
    btnDeleteConfirm:"Confirm Delete",
    btnCancel:       "Cancel",
    btnSave:         "Save",
    btnAdd:          (n: number) => n > 1 ? `Add ${n}` : "Add",
    btnSaveGroup:    (n: number) => `Save ${n} slot${n !== 1 ? "s" : ""}`,
    catNamePlaceholder: "Category name...",
    catDelete:       "Delete",
    catCancel:       "Cancel",
    catSave:         "Save",
    catAdd:          "Add",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
} as const;

type Lang = keyof typeof T;
type TDict = typeof T[Lang];

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

// ─── 카테고리 관리 인라인 패널 ──────────────────────────────────────────
interface CatPanelProps {
  editId: string | null;
  initialLabel?: string;
  initialColor?: string;
  t: TDict;
  onDone: () => void;
  onDelete?: () => void;
}

function CategoryPanel({ editId, initialLabel = "", initialColor = "#4F6CF5", t, onDone, onDelete }: CatPanelProps) {
  const { addCategory, updateCategory } = useCategoryStore();
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 30); }, []);

  const handleSave = () => {
    if (!label.trim()) return;
    if (editId) updateCategory(editId, label.trim(), color);
    else addCategory(label.trim(), color);
    onDone();
  };

  return (
    <div className="mt-2 p-3 rounded-2xl bg-surface-container border border-outline-variant/20 flex flex-col gap-3">
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={t.catNamePlaceholder}
        className="field text-sm"
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onDone(); }}
      />
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{ backgroundColor: c, borderColor: color === c ? "#fff" : "transparent", boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
          />
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        {editId && onDelete && (
          <button onClick={onDelete} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-error/40 text-error hover:bg-error/5 transition-colors">
            {t.catDelete}
          </button>
        )}
        <button onClick={onDone} className="flex-1 py-1.5 rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">
          {t.catCancel}
        </button>
        <button onClick={handleSave} disabled={!label.trim()} className="flex-1 py-1.5 rounded-full text-xs font-bold text-white transition-colors disabled:opacity-40" style={{ backgroundColor: color }}>
          {editId ? t.catSave : t.catAdd}
        </button>
      </div>
    </div>
  );
}

// ─── 메인 EventModal ──────────────────────────────────────────────────────
export default function EventModal({ open, editEvent, editEvents, defaultDay = 0, onClose, onSave, onDelete, onDeleteGroup }: EventModalProps) {
  const isEdit      = !!(editEvent || editEvents);
  const isGroupEdit = !!(editEvents && editEvents.length > 0);
  const { categories, deleteCategory } = useCategoryStore();
  const { language } = useSettingsStore();
  const t = T[language as Lang] ?? T.ko;

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState(() => useCategoryStore.getState().categories[0]?.id ?? "");
  const [slots,       setSlots]       = useState<TimeSlot[]>(() => [newSlot(defaultDay)]);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [catPanel,    setCatPanel]    = useState<
    | { mode: "new" }
    | { mode: "edit"; id: string; label: string; color: string }
    | null
  >(null);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    setCatPanel(null);

    if (editEvents && editEvents.length > 0) {
      const first = editEvents[0];
      setTitle(first.title);
      setDescription(first.description ?? "");
      setCategory(first.category);
      setSlots(editEvents.map((e) => ({
        _key: e.id,
        dayOfWeek: e.dayOfWeek,
        startTime: e.startTime,
        endTime:   e.endTime,
        location:  e.location ?? "",
      })));
    } else if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description ?? "");
      setCategory(editEvent.category);
      setSlots([{
        _key: "edit",
        dayOfWeek: editEvent.dayOfWeek,
        startTime: editEvent.startTime,
        endTime:   editEvent.endTime,
        location:  editEvent.location ?? "",
      }]);
    } else {
      setTitle("");
      setDescription("");
      setCategory(categories[0]?.id ?? "");
      setSlots([newSlot(defaultDay)]);
    }
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [open, editEvent, editEvents, defaultDay]);

  useEffect(() => {
    if (categories.length > 0 && !categories.find((c) => c.id === category)) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  if (!open) return null;

  const valid = title.trim() && slots.every((s) => s.startTime < s.endTime);

  const addSlot    = () => setSlots((prev) => [...prev, newSlot(prev[prev.length - 1]?.dayOfWeek ?? defaultDay)]);
  const removeSlot = (key: string) => setSlots((prev) => prev.filter((s) => s._key !== key));
  const patchSlot  = (key: string, patch: Partial<TimeSlot>) =>
    setSlots((prev) => prev.map((s) => (s._key === key ? { ...s, ...patch } : s)));

  const handleSave = () => {
    if (!valid) return;
    const mapped = slots.map((s) => ({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime:   s.endTime,
      location:  s.location.trim() || undefined,
    }));
    if (isGroupEdit) {
      onSave(mapped, editEvents![0].groupId);
    } else {
      onSave(mapped);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (isGroupEdit && editEvents?.[0]?.groupId) {
      onDeleteGroup?.(editEvents[0].groupId!);
    } else if (editEvent) {
      onDelete?.(editEvent.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/10 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              {isGroupEdit ? t.titleGroup(editEvents!.length) : isEdit ? t.titleEdit : t.titleNew}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isGroupEdit ? t.subGroup : isEdit ? t.subEdit : t.subNew}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[72vh] overflow-y-auto">

          {/* 제목 */}
          <div>
            <label className="label-field">{t.labelTitle}</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.placeholderTitle}
              className="field"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-field mb-0">{t.labelCategory}</label>
              <button
                onClick={() => setCatPanel(catPanel?.mode === "new" ? null : { mode: "new" })}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:opacity-70 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t.addCategory}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const styles = getCategoryStyle(c.color);
                const sel = category === c.id;
                return (
                  <div key={c.id} className="relative group">
                    <button
                      onClick={() => { setCategory(c.id); setCatPanel(null); }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all pr-7"
                      style={sel ? { backgroundColor: styles.bg, color: styles.text, outline: `2px solid ${c.color}40` } : {}}
                      {...(!sel && { className: "px-3 py-1.5 rounded-full text-xs font-semibold transition-all pr-7 bg-surface-container text-on-surface-variant hover:bg-surface-container-high" })}
                    >
                      <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCatPanel(catPanel?.mode === "edit" && catPanel.id === c.id ? null : { mode: "edit", id: c.id, label: c.label, color: c.color }); }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-on-surface-variant"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            {catPanel?.mode === "new" && <CategoryPanel editId={null} t={t} onDone={() => setCatPanel(null)} />}
            {catPanel?.mode === "edit" && (
              <CategoryPanel
                editId={catPanel.id}
                initialLabel={catPanel.label}
                initialColor={catPanel.color}
                t={t}
                onDone={() => setCatPanel(null)}
                onDelete={() => { deleteCategory(catPanel.id); setCatPanel(null); }}
              />
            )}
          </div>

          {/* 시간 슬롯 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-field mb-0">{t.labelSlots}</label>
              <span className="text-[10px] text-on-surface-variant">{t.slotCount(slots.length)}</span>
            </div>

            <div className="flex flex-col gap-3">
              {slots.map((slot, idx) => (
                <div
                  key={slot._key}
                  className="rounded-2xl bg-surface-container p-3 flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-2">
                    {/* 요일 */}
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => patchSlot(slot._key, { dayOfWeek: Number(e.target.value) })}
                      className="field text-sm flex-1 min-w-0"
                    >
                      {t.days.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>

                    {/* 시작 시간 */}
                    <select
                      value={slot.startTime}
                      onChange={(e) => {
                        const v = e.target.value;
                        patchSlot(slot._key, {
                          startTime: v,
                          endTime: v >= slot.endTime
                            ? TIME_OPTIONS[Math.min(TIME_OPTIONS.indexOf(v) + 2, TIME_OPTIONS.length - 1)]
                            : slot.endTime,
                        });
                      }}
                      className="field text-sm flex-1 min-w-0"
                    >
                      {TIME_OPTIONS.slice(0, -1).map((tm) => (
                        <option key={tm} value={tm}>{tm}</option>
                      ))}
                    </select>

                    {/* 종료 시간 */}
                    <select
                      value={slot.endTime}
                      onChange={(e) => patchSlot(slot._key, { endTime: e.target.value })}
                      className="field text-sm flex-1 min-w-0"
                    >
                      {TIME_OPTIONS.filter((tm) => tm > slot.startTime).map((tm) => (
                        <option key={tm} value={tm}>{tm}</option>
                      ))}
                    </select>

                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(slot._key)}
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <input
                    value={slot.location}
                    onChange={(e) => patchSlot(slot._key, { location: e.target.value })}
                    placeholder={t.locationPlaceholder(idx)}
                    className="field text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addSlot}
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {t.addSlot}
            </button>
          </div>

          {/* 메모 */}
          <div>
            <label className="label-field">{t.labelMemo}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.placeholderMemo}
              rows={2}
              className="field resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          {isEdit && (
            <button
              onClick={handleDelete}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                confirmDel ? "bg-error text-on-error" : "border border-error/40 text-error hover:bg-error/5"
              }`}
            >
              {confirmDel ? t.btnDeleteConfirm : isGroupEdit ? t.btnDeleteGroup : t.btnDelete}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {t.btnCancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!valid}
            className="flex-1 py-2.5 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isGroupEdit ? t.btnSaveGroup(slots.length) : isEdit ? t.btnSave : t.btnAdd(slots.length)}
          </button>
        </div>
      </div>
    </div>
  );
}
