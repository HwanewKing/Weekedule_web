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
  editEvent?: CalendarEvent | null;
  defaultDay?: number;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
  onDelete?: (id: string) => void;
}

const TIME_OPTIONS = generateTimeOptions(8, 24);

// ─── 카테고리 관리 인라인 패널 ───────────────────────────────────────────────
interface CatPanelProps {
  editId: string | null;               // null = 신규 추가 모드
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

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 30);
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
    <div className="mt-2 p-3 rounded-2xl bg-surface-container border border-outline-variant/20 flex flex-col gap-3">
      {/* 이름 입력 */}
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="카테고리 이름..."
        className="field text-sm"
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onDone(); }}
      />

      {/* 컬러 팔레트 */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: color === c ? "#fff" : "transparent",
              boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
            }}
          />
        ))}
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 mt-1">
        {editId && onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-error/40 text-error hover:bg-error/5 transition-colors"
          >
            삭제
          </button>
        )}
        <button
          onClick={onDone}
          className="flex-1 py-1.5 rounded-full border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={!label.trim()}
          className="flex-1 py-1.5 rounded-full text-xs font-bold text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {editId ? "저장" : "추가"}
        </button>
      </div>
    </div>
  );
}

// ─── 메인 EventModal ──────────────────────────────────────────────────────────
export default function EventModal({
  open,
  editEvent,
  defaultDay = 0,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const isEdit = !!editEvent;
  const { categories, deleteCategory } = useCategoryStore();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [location,    setLocation]    = useState("");
  const [category,    setCategory]    = useState("meeting");
  const [dayOfWeek,   setDayOfWeek]   = useState(defaultDay);
  const [startTime,   setStartTime]   = useState("09:00");
  const [endTime,     setEndTime]     = useState("10:00");
  const [confirmDel,  setConfirmDel]  = useState(false);

  // 카테고리 관리 패널 상태
  const [catPanel, setCatPanel] = useState<
    | { mode: "new" }
    | { mode: "edit"; id: string; label: string; color: string }
    | null
  >(null);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmDel(false);
    setCatPanel(null);
    if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description ?? "");
      setLocation(editEvent.location ?? "");
      setCategory(editEvent.category);
      setDayOfWeek(editEvent.dayOfWeek);
      setStartTime(editEvent.startTime);
      setEndTime(editEvent.endTime);
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setCategory("meeting");
      setDayOfWeek(defaultDay);
      setStartTime("09:00");
      setEndTime("10:00");
    }
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [open, editEvent, defaultDay]);

  // 선택된 카테고리가 삭제됐을 때 fallback
  useEffect(() => {
    if (categories.length > 0 && !categories.find((c) => c.id === category)) {
      setCategory(categories[0].id);
    }
  }, [categories, category]);

  if (!open) return null;

  const valid = title.trim() && startTime < endTime;

  const handleSave = () => {
    if (!valid) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      category,
      dayOfWeek,
      startTime,
      endTime,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!editEvent) return;
    if (!confirmDel) { setConfirmDel(true); return; }
    onDelete?.(editEvent.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/10 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              {isEdit ? "일정 편집" : "새 일정 추가"}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {isEdit ? "내용을 수정하거나 삭제하세요" : "시간표에 일정을 추가하세요"}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* 제목 */}
          <div>
            <label className="label-field">제목</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목..."
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
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                추가
              </button>
            </div>

            {/* 카테고리 pill 목록 */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const styles = getCategoryStyle(c.color);
                const sel = category === c.id;
                return (
                  <div key={c.id} className="relative group">
                    <button
                      onClick={() => {
                        setCategory(c.id);
                        setCatPanel(null);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all pr-7"
                      style={
                        sel
                          ? {
                              backgroundColor: styles.bg,
                              color: styles.text,
                              outline: `2px solid ${c.color}40`,
                            }
                          : {}
                      }
                      // 미선택 상태 클래스 (inline style 없을 때 적용)
                      {...(!sel && { className: "px-3 py-1.5 rounded-full text-xs font-semibold transition-all pr-7 bg-surface-container text-on-surface-variant hover:bg-surface-container-high" })}
                    >
                      {/* 컬러 도트 */}
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.label}
                    </button>

                    {/* 편집 버튼 (hover 시 노출) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCatPanel(
                          catPanel?.mode === "edit" && catPanel.id === c.id
                            ? null
                            : { mode: "edit", id: c.id, label: c.label, color: c.color }
                        );
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-on-surface-variant"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 신규 추가 패널 */}
            {catPanel?.mode === "new" && (
              <CategoryPanel
                editId={null}
                onDone={() => setCatPanel(null)}
              />
            )}

            {/* 편집 패널 */}
            {catPanel?.mode === "edit" && (
              <CategoryPanel
                editId={catPanel.id}
                initialLabel={catPanel.label}
                initialColor={catPanel.color}
                onDone={() => setCatPanel(null)}
                onDelete={() => {
                  deleteCategory(catPanel.id);
                  setCatPanel(null);
                }}
              />
            )}
          </div>

          {/* 요일 */}
          <div>
            <label className="label-field">요일</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDayOfWeek(i)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    dayOfWeek === i
                      ? "bg-primary text-on-primary"
                      : i >= 5
                      ? "bg-surface-container text-on-surface-variant/50 hover:bg-surface-container-high"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">시작 시간</label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (e.target.value >= endTime) {
                    const idx = TIME_OPTIONS.indexOf(e.target.value);
                    setEndTime(TIME_OPTIONS[Math.min(idx + 2, TIME_OPTIONS.length - 1)]);
                  }
                }}
                className="field"
              >
                {TIME_OPTIONS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">종료 시간</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="field"
              >
                {TIME_OPTIONS.filter((t) => t > startTime).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 장소 */}
          <div>
            <label className="label-field">장소 (선택)</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="강의실, 회의실..."
              className="field"
            />
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
                confirmDel
                  ? "bg-error text-on-error"
                  : "border border-error/40 text-error hover:bg-error/5"
              }`}
            >
              {confirmDel ? "정말 삭제" : "삭제"}
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
            {isEdit ? "저장" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}
