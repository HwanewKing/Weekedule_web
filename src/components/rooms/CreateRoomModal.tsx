"use client";

import { useState, useRef, useEffect } from "react";
import { RoomColor, RoomIcon, COLOR_CONFIG } from "@/types/room";
import RoomIconEl from "./RoomIcon";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; color: RoomColor; icon: RoomIcon }) => void;
}

const COLORS: { value: RoomColor; label: string }[] = [
  { value: "primary",           label: "블루" },
  { value: "secondary",         label: "인디고" },
  { value: "tertiary",          label: "오렌지" },
  { value: "primary-container", label: "퍼플" },
];

const ICONS: RoomIcon[] = ["rocket", "people", "science", "palette", "code", "book", "music", "sports"];

export default function CreateRoomModal({ open, onClose, onSave }: CreateRoomModalProps) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [color,       setColor]       = useState<RoomColor>("primary");
  const [icon,        setIcon]        = useState<RoomIcon>("rocket");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(""); setDescription(""); setColor("primary"); setIcon("rocket");
      setTimeout(() => nameRef.current?.focus(), 60);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), color, icon });
    onClose();
  };

  const colors = COLOR_CONFIG[color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/10 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
              새 Room 만들기
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">팀과 일정을 공유하는 공간을 만드세요</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Preview */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${colors.iconBg}`}>
            <div className={`p-3 rounded-xl ${colors.iconBg} border border-white/40 ${colors.iconText}`}>
              <RoomIconEl icon={icon} />
            </div>
            <div>
              <p className={`text-sm font-bold ${colors.iconText}`}>{name || "Room 이름"}</p>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{description || "설명을 입력하세요"}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label-field">Room 이름</label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 팀 프로젝트 A"
              className="field"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-field">설명 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 Room의 목적을 간략히..."
              rows={2}
              className="field resize-none"
            />
          </div>

          {/* Color */}
          <div>
            <label className="label-field">색상</label>
            <div className="flex gap-2">
              {COLORS.map((c) => {
                const cfg = COLOR_CONFIG[c.value];
                const sel = color === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${cfg.iconBg} ${cfg.iconText} ${
                      sel ? "ring-2 ring-current" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="label-field">아이콘</label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
                    icon === ic
                      ? `${colors.iconBg} ${colors.iconText} ring-2 ring-current`
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <RoomIconEl icon={ic} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-full btn-gradient text-sm font-bold text-on-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
}
