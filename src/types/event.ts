/** 카테고리 ID는 자유로운 string (기본값: "class" | "meeting" | "deepwork" | "personal" | "break") */
export type EventCategory = string;

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dayOfWeek: number;  // 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  category: EventCategory;
  location?: string;
  attendees?: string[];
  groupId?: string;   // 다중 슬롯 묶음 ID (함께 생성된 이벤트 그룹)
}

export const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/** "HH:MM" → 분 단위 숫자 */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** 08:00 ~ 24:00 사이 30분 간격 선택지 */
export function generateTimeOptions(from = 8, to = 24): string[] {
  const opts: string[] = [];
  for (let h = from; h <= to; h++) {
    if (h === to) {
      opts.push("24:00");
      break;
    }
    opts.push(`${String(h).padStart(2, "0")}:00`);
    opts.push(`${String(h).padStart(2, "0")}:30`);
  }
  return opts;
}
