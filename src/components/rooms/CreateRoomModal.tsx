"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/settingsStore";
import {
  ROOM_COLOR_OPTIONS,
  getRoomColorHex,
  hexToRgba,
  type RoomColor,
  type RoomIcon,
} from "@/types/room";
import RoomIconEl from "./RoomIcon";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    color: RoomColor;
    icon: RoomIcon;
  }) => void;
}

interface CreateRoomModalContentProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    color: RoomColor;
    icon: RoomIcon;
  }) => void;
}

const ICONS: RoomIcon[] = [
  "rocket",
  "people",
  "science",
  "palette",
  "code",
  "book",
  "music",
  "sports",
];

const T = {
  ko: {
    title: "새 방 만들기",
    subtitle: "함께 일정을 조율할 협업 공간을 설정해 보세요.",
    previewName: "방 이름",
    previewDescription: "방 설명을 입력해 보세요.",
    nameLabel: "방 이름",
    namePlaceholder: "예: 프로젝트 A",
    descriptionLabel: "설명 (선택)",
    descriptionPlaceholder: "이 방의 목적이나 분위기를 간단히 적어 주세요.",
    colorLabel: "색상",
    iconLabel: "아이콘",
    cancel: "취소",
    create: "만들기",
  },
  en: {
    title: "Create Room",
    subtitle: "Set up a shared space for coordinating schedules.",
    previewName: "Room name",
    previewDescription: "Add a short description.",
    nameLabel: "Room name",
    namePlaceholder: "e.g. Project A",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Describe the purpose of this room.",
    colorLabel: "Color",
    iconLabel: "Icon",
    cancel: "Cancel",
    create: "Create",
  },
} as const;

function CreateRoomModalContent({
  onClose,
  onSave,
}: CreateRoomModalContentProps) {
  const { language } = useSettingsStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<RoomColor>("blue");
  const [icon, setIcon] = useState<RoomIcon>("rocket");
  const t = T[language];

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSave({
      name: trimmedName,
      description: description.trim(),
      color,
      icon,
    });
    onClose();
  };

  const hex = getRoomColorHex(color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface-container-lowest shadow-ambient">
        <div className="flex items-start justify-between border-b border-outline-variant/10 px-6 pb-4 pt-6">
          <div>
            <h2
              className="text-xl font-extrabold text-on-surface"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {t.title}
            </h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
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

        <div className="flex flex-col gap-5 px-6 py-5">
          <div
            className="flex items-center gap-4 rounded-2xl p-4"
            style={{ backgroundColor: hexToRgba(hex, 0.1) }}
          >
            <div
              className="rounded-xl border border-white/40 p-3"
              style={{ backgroundColor: hexToRgba(hex, 0.15), color: hex }}
            >
              <RoomIconEl icon={icon} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: hex }}>
                {name || t.previewName}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-on-surface-variant">
                {description || t.previewDescription}
              </p>
            </div>
          </div>

          <div>
            <label className="label-field">{t.nameLabel}</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.namePlaceholder}
              className="field"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
              }}
            />
          </div>

          <div>
            <label className="label-field">{t.descriptionLabel}</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={2}
              className="field resize-none"
            />
          </div>

          <div>
            <label className="label-field">{t.colorLabel}</label>
            <div className="flex flex-wrap gap-3">
              {ROOM_COLOR_OPTIONS.map((option) => {
                const selected = color === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setColor(option.value)}
                    title={option.label}
                    className="h-8 w-8 rounded-full transition-all hover:scale-110"
                    style={{
                      backgroundColor: option.hex,
                      boxShadow: selected
                        ? `0 0 0 3px white, 0 0 0 5px ${option.hex}`
                        : "none",
                      transform: selected ? "scale(1.15)" : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="label-field">{t.iconLabel}</label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((nextIcon) => {
                const isSelected = icon === nextIcon;
                return (
                  <button
                    key={nextIcon}
                    onClick={() => setIcon(nextIcon)}
                    className={`flex aspect-square items-center justify-center rounded-xl transition-all ${
                      isSelected
                        ? ""
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: hexToRgba(hex, 0.15),
                            color: hex,
                            outline: `2px solid ${hex}`,
                          }
                        : undefined
                    }
                  >
                    <RoomIconEl icon={nextIcon} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-outline-variant py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.create}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateRoomModal({
  open,
  onClose,
  onSave,
}: CreateRoomModalProps) {
  if (!open) return null;

  return <CreateRoomModalContent onClose={onClose} onSave={onSave} />;
}
