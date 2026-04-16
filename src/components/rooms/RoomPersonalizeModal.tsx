"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { RoomPreference, useRoomPreferencesStore } from "@/lib/roomPreferencesStore";
import { useSettingsStore } from "@/lib/settingsStore";
import {
  ROOM_COLOR_OPTIONS,
  getRoomColorHex,
  hexToRgba,
  type Room,
  type RoomColor,
  type RoomIcon,
} from "@/types/room";
import RoomIconEl from "./RoomIcon";

const ICON_OPTIONS: RoomIcon[] = [
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
    title: "룸 관리",
    subtitle: "이 설정은 나에게만 보여요.",
    icon: "아이콘",
    color: "색상",
    memo: "메모",
    memoPlaceholder: "이 룸을 나만의 방식으로 기억해보세요.",
    cancel: "취소",
    save: "저장",
  },
  en: {
    title: "Room Preferences",
    subtitle: "These changes are only visible to you.",
    icon: "Icon",
    color: "Color",
    memo: "Memo",
    memoPlaceholder: "Add a private note for this room.",
    cancel: "Cancel",
    save: "Save",
  },
} as const;

interface RoomPersonalizeModalProps {
  room: Room;
  open: boolean;
  onClose: () => void;
}

type RoomPersonalizeLabels = (typeof T)[keyof typeof T];

export default function RoomPersonalizeModal({
  room,
  open,
  onClose,
}: RoomPersonalizeModalProps) {
  const { user } = useAuthStore();
  const { language } = useSettingsStore();
  const t = T[language];
  const { getRoomPreference } = useRoomPreferencesStore();

  const existing = getRoomPreference(user?.id, room.id);

  if (!open) return null;

  return (
    <RoomPersonalizeModalContent
      key={`${user?.id ?? "guest"}-${room.id}-${JSON.stringify(existing ?? {})}`}
      room={room}
      userId={user?.id}
      existing={existing ?? {}}
      t={t}
      onClose={onClose}
    />
  );
}

interface RoomPersonalizeModalContentProps {
  room: Room;
  userId?: string;
  existing: RoomPreference;
  t: RoomPersonalizeLabels;
  onClose: () => void;
}

function RoomPersonalizeModalContent({
  room,
  userId,
  existing,
  t,
  onClose,
}: RoomPersonalizeModalContentProps) {
  const { setRoomPreference } = useRoomPreferencesStore();
  const [draft, setDraft] = useState<RoomPreference>(existing);

  const previewColor: RoomColor = draft.color ?? room.color;
  const previewIcon: RoomIcon = draft.icon ?? room.icon;
  const previewHex = getRoomColorHex(previewColor);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 shadow-ambient">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: "var(--font-manrope)" }}>
            {t.title}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">{t.subtitle}</p>
        </div>

        <div className="mb-5 flex items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: hexToRgba(previewHex, 0.1) }}>
          <div
            className="rounded-xl border border-white/40 p-3"
            style={{ backgroundColor: hexToRgba(previewHex, 0.15), color: previewHex }}
          >
            <RoomIconEl icon={previewIcon} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: previewHex }}>
              {room.name}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-on-surface-variant">
              {draft.memo || room.description}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.icon}
            </p>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((icon) => {
                const active = (draft.icon ?? room.icon) === icon;
                return (
                  <button
                    key={icon}
                    onClick={() => setDraft((prev) => ({ ...prev, icon }))}
                    className={`flex aspect-square items-center justify-center rounded-xl transition-all ${
                      active
                        ? ""
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: hexToRgba(previewHex, 0.15),
                            color: previewHex,
                            outline: `2px solid ${previewHex}`,
                          }
                        : undefined
                    }
                  >
                    <RoomIconEl icon={icon} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.color}
            </p>
            <div className="flex flex-wrap gap-3">
              {ROOM_COLOR_OPTIONS.map((option) => {
                const active = (draft.color ?? room.color) === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setDraft((prev) => ({ ...prev, color: option.value }))}
                    title={option.label}
                    className="h-8 w-8 rounded-full transition-all hover:scale-110"
                    style={{
                      backgroundColor: option.hex,
                      boxShadow: active
                        ? `0 0 0 3px white, 0 0 0 5px ${option.hex}`
                        : "none",
                      transform: active ? "scale(1.15)" : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.memo}
            </p>
            <textarea
              value={draft.memo ?? ""}
              onChange={(event) => setDraft((prev) => ({ ...prev, memo: event.target.value }))}
              rows={3}
              placeholder={t.memoPlaceholder}
              className="field resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-outline-variant py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => {
              setRoomPreference(userId, room.id, {
                icon: draft.icon,
                color: draft.color,
                memo: draft.memo?.trim() ? draft.memo.trim() : undefined,
              });
              onClose();
            }}
            className="btn-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-on-primary"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
