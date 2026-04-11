"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarEvent,
  DAY_LABELS,
  generateTimeOptions,
} from "@/types/event";
import {
  useCategoryStore,
  getCategoryStyle,
  PRESET_COLORS,
} from "@/lib/categoryStore";

interface EventModalProps {
  open: boolean;
  editEvent?: CalendarEvent | null;   // 단일 이벤트 편집
  editEvents?: CalendarEvent[] | null; // 그룹 이벤트 편집
  defaultDay?: number;
  onClose: () => void;
  onSave: (events: Omit<CalendarEvent, "id">[], groupId?: string) => void;
  onDelete?: (id: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

interface TimeSlot {
  _key: string;       // 내부 React key용
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
  onDone: () => void;
  onDelete?: () => void;
}

function CategoryPanel({ editId, initialLabel = "", initialColor = "#4F6CF5", onDone, onDelete }: CatPanelProps) {
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
        placeholder="카테고리 이름..."
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
          <button onClick={onDelete} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-error/40 text-error hover:bg-error/5 transition-colors">삭제</button>
        )}
        <button onClick={onDone} className="flex-1 py-1.5 rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">취소</button>
        <button onClick={handleSave} disabled={!label.trim()} className="flex-1 py-1.5 rounded-full text-xs font-bold text-white transition-colors disabled:opacity-40" style={{ backgroundColor: color }}>{editId ? "저장" : "추가"}</button>
      </div>
    </div>
  );
}

// ─── 메인 EventModal ──────────────────────────────────────────────────────
export default function EventModal({ open, editEvent, editEvents, defaultDay = 0, onClose, onSave, onDelete, onDeleteGroup }: EventModalProps) {
  const isEdit      = !!(editEvent || editEvents);
  const isGroupEdit = !!(editEvents && editEvents.length > 0);
  const { categories, deleteCategory } = useCategoryStore();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  // 기본값을 "meeting" 하드코딩 대신 스토어 첫 번째 카테고리로 설정
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
      // 그룹 편집 모드: 첫 번째 이벤트에서 공통 정보 가져오기
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

  // ─ 슬롯 조작 ─
  const addSlot = () => setSlots((prev) => [...prev, newSlot(prev[prev.length - 1]?.dayOfWeek ?? defaultDay)]);
  const removeSlot = (key: string) => setSlots((prev) => prev.filter((s) => s._key !== key));
  const patchSlot = (key: string, patch: Partial<TimeSlot>) =>
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
      // 그룹 편집: 기존 groupId 유지
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
              {isGroupEdit ? `그룹 일정 편집 (${editEvents!.length}개)` : isEdit ? "일정 편집" : "새 일정 추가"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isGroupEdit ? "함께 등록된 일정을 한번에 수정하세요" : isEdit ? "내용을 수정하거나 삭제하세요" : "요일·시간을 추가해 반복 일정을 한번에 등록하세요"}
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
            <label className="label-field">일정 제목</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 운영체제, 팀 미팅..."
              className="field"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* 카테고리 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-field mb-0">카테고리</label>
              <button
                onClick={() => setCatPanel(catPanel?.mode === "new" ? null : { mode: "new" })}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:opacity-70 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                추가
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
            {catPanel?.mode === "new" && <CategoryPanel editId={null} onDone={() => setCatPanel(null)} />}
            {catPanel?.mode === "edit" && (
              <CategoryPanel
                editId={catPanel.id}
                initialLabel={catPanel.label}
                initialColor={catPanel.color}
                onDone={() => setCatPanel(null)}
                onDelete={() => { deleteCategory(catPanel.id); setCatPanel(null); }}
              />
            )}
          </div>

          {/* 시간 슬롯 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label-field mb-0">요일 &amp; 시간</label>
              {!isEdit && (
                <span className="text-[10px] text-on-surface-variant">{slots.length}개 슬롯</span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {slots.map((slot, idx) => (
                <div
                  key={slot._key}
                  className="rounded-2xl bg-surface-container p-3 flex flex-col gap-2.5"
                >
                  {/* 요일 + 시간 행 */}
                  <div className="flex items-center gap-2">
                    {/* 요일 */}
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => patchSlot(slot._key, { dayOfWeek: Number(e.target.value) })}
                      className="field text-sm flex-1 min-w-0"
                    >
                      {DAY_LABELS.map((d, i) => (
                        <option key={i} value={i}>{d}요일</option>
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
                      {TIME_OPTIONS.slice(0, -1).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {/* 종료 시간 */}
                    <select
                      value={slot.endTime}
                      onChange={(e) => patchSlot(slot._key, { endTime: e.target.value })}
                      className="field text-sm flex-1 min-w-0"
                    >
                      {TIME_OPTIONS.filter((t) => t > slot.startTime).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {/* 삭제 버튼 (슬롯이 2개 이상일 때만) */}
                    {!isEdit && slots.length > 1 && (
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

                  {/* 장소 행 */}
                  <input
                    value={slot.location}
                    onChange={(e) => patchSlot(slot._key, { location: e.target.value })}
                    placeholder={`장소 (선택) ${idx + 1}`}
                    className="field text-sm"
                  />
                </div>
              ))}
            </div>

            {/* 슬롯 추가 버튼 */}
            {!isEdit && (
              <button
                onClick={addSlot}
                className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                시간 및 장소 추가
              </button>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="label-field">메모 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 메모..."
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
              {confirmDel ? "정말 삭제" : isGroupEdit ? "전체 삭제" : "삭제"}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!valid}
            className="flex-1 py-2.5 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isGroupEdit ? `${slots.length}개 슬롯 저장` : isEdit ? "저장" : slots.length > 1 ? `${slots.length}개 추가` : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
