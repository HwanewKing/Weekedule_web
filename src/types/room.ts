import { CalendarEvent } from "./event";

export type RoomColor = "blue" | "violet" | "teal" | "green" | "orange" | "rose" | "amber" | "indigo";
export type RoomIcon = "rocket" | "people" | "science" | "palette" | "code" | "book" | "music" | "sports";

export interface RoomMember {
  id: string;
  userId: string;
  name: string;
  initials: string;
  colorId: string;   // key into MEMBER_COLOR_OPTIONS
  events: CalendarEvent[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  color: RoomColor;
  icon: RoomIcon;
  members: RoomMember[];
  heatmapColor: string;   // key into HEATMAP_COLOR_OPTIONS
  nextSync?: string;
  nextSyncDay?: string;
  createdAt: string;
}

export interface ConfirmedSlot {
  id: string;
  roomId: string;
  dayOfWeek: number;
  startTime: string;  // "HH:MM"
  endTime: string;
  createdAt: string;
}

// ── 멤버 고유 색상 옵션 (8가지) ────────────────────────────────
export const MEMBER_COLOR_OPTIONS: { id: string; bg: string; text: string; label: string }[] = [
  { id: "blue",   bg: "#dbeafe", text: "#1d4ed8", label: "Blue"   },
  { id: "violet", bg: "#ede9fe", text: "#6d28d9", label: "Violet" },
  { id: "green",  bg: "#dcfce7", text: "#16a34a", label: "Green"  },
  { id: "pink",   bg: "#fce7f3", text: "#9d174d", label: "Pink"   },
  { id: "orange", bg: "#ffedd5", text: "#c2410c", label: "Orange" },
  { id: "teal",   bg: "#ccfbf1", text: "#0f766e", label: "Teal"   },
  { id: "red",    bg: "#fee2e2", text: "#b91c1c", label: "Red"    },
  { id: "amber",  bg: "#fef9c3", text: "#92400e", label: "Amber"  },
];

// ── 히트맵 색상 옵션 (5가지) ──────────────────────────────────
export const HEATMAP_COLOR_OPTIONS: { id: string; hex: string; label: string }[] = [
  { id: "blue",   hex: "#1d4ed8", label: "Blue"   },
  { id: "violet", hex: "#6d28d9", label: "Violet" },
  { id: "teal",   hex: "#0f766e", label: "Teal"   },
  { id: "orange", hex: "#c2410c", label: "Orange" },
  { id: "rose",   hex: "#be123c", label: "Rose"   },
];

// ── Room 색상 옵션 (8가지) ────────────────────────────────────
export const ROOM_COLOR_OPTIONS: { value: RoomColor; hex: string; label: string }[] = [
  { value: "blue",   hex: "#2a4dd7", label: "Blue"   },
  { value: "violet", hex: "#6d28d9", label: "Violet" },
  { value: "teal",   hex: "#0f766e", label: "Teal"   },
  { value: "green",  hex: "#16a34a", label: "Green"  },
  { value: "orange", hex: "#ea580c", label: "Orange" },
  { value: "rose",   hex: "#e11d48", label: "Rose"   },
  { value: "amber",  hex: "#d97706", label: "Amber"  },
  { value: "indigo", hex: "#4f46e5", label: "Indigo" },
];

/** hex → rgba(r,g,b,alpha) */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** RoomColor → hex */
export function getRoomColorHex(color: RoomColor): string {
  return ROOM_COLOR_OPTIONS.find((c) => c.value === color)?.hex ?? "#2a4dd7";
}

/** colorId → { backgroundColor, color } inline style 객체 */
export function getMemberStyle(colorId: string): { backgroundColor: string; color: string } {
  const opt = MEMBER_COLOR_OPTIONS.find((o) => o.id === colorId) ?? MEMBER_COLOR_OPTIONS[0];
  return { backgroundColor: opt.bg, color: opt.text };
}

/** heatmapColorId + busyRatio(0=all free, 1=all busy) → inline style 객체
 *  alpha = 1 - busyRatio = freeCount / n
 */
export function getHeatStyle(ratio: number, heatmapColorId: string): { backgroundColor?: string } {
  const opt = HEATMAP_COLOR_OPTIONS.find((o) => o.id === heatmapColorId) ?? HEATMAP_COLOR_OPTIONS[0];
  const hex = opt.hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { backgroundColor: `rgba(${r},${g},${b},${1 - ratio})` };
}

/** 범례 그라데이션 CSS 문자열 (Free → Busy) */
export function getHeatGradient(heatmapColorId: string): string {
  const opt = HEATMAP_COLOR_OPTIONS.find((o) => o.id === heatmapColorId) ?? HEATMAP_COLOR_OPTIONS[0];
  const hex = opt.hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `linear-gradient(to right, rgba(${r},${g},${b},1), rgba(${r},${g},${b},0))`;
}

/** 하위 호환: colorIdx → colorId */
export function colorIdxToId(idx: number): string {
  return MEMBER_COLOR_OPTIONS[idx % MEMBER_COLOR_OPTIONS.length].id;
}
