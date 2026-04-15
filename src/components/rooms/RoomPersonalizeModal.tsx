"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { RoomPreference, useRoomPreferencesStore } from "@/lib/roomPreferencesStore";
import { useSettingsStore } from "@/lib/settingsStore";
import { ROOM_COLOR_OPTIONS, hexToRgba, type Room } from "@/types/room";

const EMOJI_OPTIONS = ["🚀", "👥", "🧪", "🎨", "💻", "📚", "🎵", "⚽", "📅", "✨"];

const T = {
  ko: {
    title: "룸 관리",
    subtitle: "이 설정은 나에게만 보여요.",
    emoji: "이모지",
    color: "색상",
    memo: "메모",
    memoPlaceholder: "이 룸을 나만의 방식으로 기억해보세요.",
    cancel: "취소",
    save: "저장",
  },
  en: {
    title: "Room Preferences",
    subtitle: "These changes are only visible to you.",
    emoji: "Emoji",
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

export default function RoomPersonalizeModal({
  room,
  open,
  onClose,
}: RoomPersonalizeModalProps) {
  const { user } = useAuthStore();
  const { language } = useSettingsStore();
  const t = T[language];
  const { getRoomPreference, setRoomPreference } = useRoomPreferencesStore();

  const existing = getRoomPreference(user?.id, room.id);
  const [draft, setDraft] = useState<RoomPreference>(existing ?? {});

  useEffect(() => {
    if (open) {
      setDraft(existing ?? {});
    }
  }, [existing, open]);

  if (!open) return null;

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

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.emoji}
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => {
                const active = draft.emoji === emoji;
                return (
                  <button
                    key={emoji}
                    onClick={() =>
                      setDraft((prev) => ({ ...prev, emoji: active ? undefined : emoji }))
                    }
                    className={`rounded-2xl border px-3 py-2 text-lg transition-all ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-outline-variant/20 hover:border-outline-variant/60"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              {t.color}
            </p>
            <div className="flex flex-wrap gap-2">
              {ROOM_COLOR_OPTIONS.map((option) => {
                const active = draft.colorHex === option.hex;
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        colorHex: active ? undefined : option.hex,
                      }))
                    }
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-current shadow-sm"
                        : "border-outline-variant/20 hover:border-outline-variant/60"
                    }`}
                    style={{
                      color: option.hex,
                      backgroundColor: active ? hexToRgba(option.hex, 0.12) : undefined,
                    }}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.hex }} />
                    {option.label}
                  </button>
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
              setRoomPreference(user?.id, room.id, {
                emoji: draft.emoji,
                colorHex: draft.colorHex,
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
