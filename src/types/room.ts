import { CalendarEvent } from "./event";

export type RoomStatus = "active" | "waiting" | "archived";
export type RoomColor = "primary" | "secondary" | "tertiary" | "primary-container";
export type RoomIcon = "rocket" | "people" | "science" | "palette" | "code" | "book" | "music" | "sports";

export interface RoomMember {
  id: string;
  name: string;
  initials: string;
  colorId: string;   // key into MEMBER_COLOR_OPTIONS
  events: CalendarEvent[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  status: RoomStatus;
  color: RoomColor;
  icon: RoomIcon;
  members: RoomMember[];
  heatmapColor: string;   // key into HEATMAP_COLOR_OPTIONS
  nextSync?: string;
  nextSyncDay?: string;
  createdAt: string;
}

export interface SelectedSlot {
  dayOfWeek: number;  // 0=월~6=일
  startTime: string;  // "HH:MM"
  endTime: string;
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

/** colorId → { backgroundColor, color } inline style 객체 */
export function getMemberStyle(colorId: string): { backgroundColor: string; color: string } {
  const opt = MEMBER_COLOR_OPTIONS.find((o) => o.id === colorId) ?? MEMBER_COLOR_OPTIONS[0];
  return { backgroundColor: opt.bg, color: opt.text };
}

/** heatmapColorId + ratio → inline style 객체 */
export function getHeatStyle(ratio: number, heatmapColorId: string): { backgroundColor?: string } {
  if (ratio === 0) return {};
  const opt = HEATMAP_COLOR_OPTIONS.find((o) => o.id === heatmapColorId) ?? HEATMAP_COLOR_OPTIONS[0];
  const hex = opt.hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const alpha = ratio <= 0.25 ? 0.15 : ratio <= 0.5 ? 0.35 : ratio <= 0.75 ? 0.6 : 0.85;
  return { backgroundColor: `rgba(${r},${g},${b},${alpha})` };
}

export const STATUS_CONFIG: Record<RoomStatus, { label: string; bg: string; text: string }> = {
  active:   { label: "Active",   bg: "bg-[#dcfce7]", text: "text-[#16a34a]" },
  waiting:  { label: "Waiting",  bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  archived: { label: "Archived", bg: "bg-surface-dim", text: "text-on-surface-variant" },
};

export const COLOR_CONFIG: Record<RoomColor, { accent: string; iconBg: string; iconText: string }> = {
  "primary":           { accent: "bg-primary",           iconBg: "bg-primary-fixed",       iconText: "text-primary" },
  "secondary":         { accent: "bg-secondary",         iconBg: "bg-secondary-fixed",     iconText: "text-secondary" },
  "tertiary":          { accent: "bg-tertiary",          iconBg: "bg-tertiary-fixed",      iconText: "text-tertiary" },
  "primary-container": { accent: "bg-primary-container", iconBg: "bg-secondary-container", iconText: "text-on-secondary-container" },
};

/** 하위 호환: colorIdx → colorId */
export function colorIdxToId(idx: number): string {
  return MEMBER_COLOR_OPTIONS[idx % MEMBER_COLOR_OPTIONS.length].id;
}
