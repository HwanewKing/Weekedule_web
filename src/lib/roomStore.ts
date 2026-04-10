"use client";

import { create } from "zustand";
import { Room, RoomMember, RoomColor, RoomIcon, colorIdxToId } from "@/types/room";
import { CalendarEvent } from "@/types/event";

interface RoomStore {
  rooms: Room[];
  addRoom: (data: { name: string; description: string; color: RoomColor; icon: RoomIcon }) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addMember: (roomId: string, member: Omit<RoomMember, "events"> & { events?: RoomMember["events"] }) => void;
  removeMember: (roomId: string, memberId: string) => void;
  updateMemberColor: (roomId: string, memberId: string, colorId: string) => void;
}

// ── 멤버 시드 이벤트 헬퍼 ──────────────────────────────────────
function ev(id: string, title: string, day: number, start: string, end: string, cat: CalendarEvent["category"] = "meeting"): CalendarEvent {
  return { id, title, dayOfWeek: day, startTime: start, endTime: end, category: cat };
}

const MEMBER_EVENTS: Record<string, CalendarEvent[]> = {
  m1: [
    ev("m1-1", "알고리즘 수업",  0, "09:00", "11:00", "class"),
    ev("m1-2", "점심 미팅",      1, "12:00", "13:00", "meeting"),
    ev("m1-3", "코드 리뷰",      2, "14:00", "15:30", "deepwork"),
    ev("m1-4", "스터디 그룹",    3, "10:00", "12:00", "class"),
    ev("m1-5", "주간 보고",      4, "16:00", "17:00", "meeting"),
  ],
  m2: [
    ev("m2-1", "디자인 리뷰",    0, "10:00", "11:30", "meeting"),
    ev("m2-2", "프론트 작업",    1, "09:00", "12:00", "deepwork"),
    ev("m2-3", "팀 미팅",        2, "14:00", "15:00", "meeting"),
    ev("m2-4", "UX 세션",        3, "13:00", "14:00", "meeting"),
    ev("m2-5", "스프린트 회고",  4, "15:00", "16:30", "meeting"),
  ],
  m3: [
    ev("m3-1", "기획 회의",      0, "09:30", "11:00", "meeting"),
    ev("m3-2", "문서 작업",      1, "13:00", "15:00", "deepwork"),
    ev("m3-3", "고객 미팅",      2, "10:00", "11:30", "meeting"),
    ev("m3-4", "아키텍처 리뷰",  3, "14:00", "16:00", "deepwork"),
    ev("m3-5", "OKR 체크",       4, "10:00", "11:00", "meeting"),
  ],
  m4: [
    ev("m4-1", "DB 설계",        0, "09:00", "10:30", "deepwork"),
    ev("m4-2", "팀 스탠드업",    1, "09:00", "09:30", "meeting"),
    ev("m4-3", "백엔드 작업",    2, "13:00", "17:00", "deepwork"),
    ev("m4-4", "코드 리뷰",      3, "11:00", "12:00", "meeting"),
    ev("m4-5", "배포 준비",      4, "14:00", "16:00", "deepwork"),
  ],
  m5: [
    ev("m5-1", "마케팅 미팅",    0, "10:00", "11:00", "meeting"),
    ev("m5-2", "콘텐츠 제작",    1, "13:00", "16:00", "deepwork"),
    ev("m5-3", "SNS 리뷰",       2, "09:00", "10:00", "meeting"),
    ev("m5-4", "광고 기획",      3, "14:00", "15:30", "meeting"),
    ev("m5-5", "주간 리포트",    4, "11:00", "12:00", "deepwork"),
  ],
  m6: [
    ev("m6-1", "수업",           0, "09:00", "12:00", "class"),
    ev("m6-2", "동아리 회의",    1, "15:00", "16:00", "meeting"),
    ev("m6-3", "수업",           2, "09:00", "11:00", "class"),
    ev("m6-4", "스터디",         3, "18:00", "20:00", "class"),
    ev("m6-5", "과제",           4, "13:00", "15:00", "deepwork"),
  ],
  m7: [
    ev("m7-1", "수업",           1, "09:00", "11:00", "class"),
    ev("m7-2", "점심",           1, "12:00", "13:00", "break"),
    ev("m7-3", "수업",           3, "10:00", "12:00", "class"),
    ev("m7-4", "동아리 운영",    4, "16:00", "18:00", "meeting"),
  ],
  m8: [
    ev("m8-1", "논문 작업",      0, "09:00", "12:00", "deepwork"),
    ev("m8-2", "세미나",         1, "14:00", "16:00", "class"),
    ev("m8-3", "랩 미팅",        2, "10:00", "11:00", "meeting"),
    ev("m8-4", "논문 작업",      3, "09:00", "13:00", "deepwork"),
    ev("m8-5", "학회 발표 준비", 4, "14:00", "17:00", "deepwork"),
  ],
  m9: [
    ev("m9-1", "데이터 분석",    0, "10:00", "12:00", "deepwork"),
    ev("m9-2", "팀 미팅",        1, "13:00", "14:00", "meeting"),
    ev("m9-3", "코딩 작업",      2, "09:00", "12:00", "deepwork"),
    ev("m9-4", "발표 준비",      3, "15:00", "17:00", "deepwork"),
  ],
  m10: [
    ev("m10-1", "수업",          0, "09:00", "11:00", "class"),
    ev("m10-2", "연구 미팅",     1, "10:00", "11:30", "meeting"),
    ev("m10-3", "실험",          2, "13:00", "16:00", "deepwork"),
    ev("m10-4", "세미나",        3, "14:00", "16:00", "class"),
    ev("m10-5", "보고서 작성",   4, "10:00", "12:00", "deepwork"),
  ],
  m11: [
    ev("m11-1", "디자인 작업",      0, "09:00", "12:00", "deepwork"),
    ev("m11-2", "클라이언트 미팅",  1, "14:00", "15:30", "meeting"),
    ev("m11-3", "크리에이티브 리뷰",2, "10:00", "11:30", "meeting"),
    ev("m11-4", "포트폴리오",       3, "13:00", "16:00", "deepwork"),
    ev("m11-5", "팀 피드백",        4, "10:00", "11:00", "meeting"),
  ],
  m12: [
    ev("m12-1", "브랜드 작업",   0, "10:00", "13:00", "deepwork"),
    ev("m12-2", "디자인 싱크",   1, "10:00", "11:00", "meeting"),
    ev("m12-3", "소재 제작",     2, "13:00", "17:00", "deepwork"),
    ev("m12-4", "피드백 세션",   3, "11:00", "12:30", "meeting"),
    ev("m12-5", "회고",          4, "16:00", "17:00", "meeting"),
  ],
};

function makeMember(id: string, name: string, initials: string, colorIdx: number): RoomMember {
  return {
    id,
    name,
    initials,
    colorId: colorIdxToId(colorIdx),
    events: MEMBER_EVENTS[id] ?? [],
  };
}

const SEED_ROOMS: Room[] = [
  {
    id: "r1",
    name: "Team Project A",
    description: "분기별 로드맵 동기화와 핵심 플랫폼 아키텍처 리뷰 미팅",
    status: "active",
    color: "primary",
    icon: "rocket",
    heatmapColor: "blue",
    members: [
      makeMember("m1", "김지수", "김지", 0),
      makeMember("m2", "이민준", "이민", 1),
      makeMember("m3", "박서연", "박서", 2),
      makeMember("m4", "최도현", "최도", 3),
      makeMember("m5", "한소율", "한소", 4),
    ],
    nextSync: "14:00",
    nextSyncDay: "내일",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2",
    name: "Club Managers",
    description: "동아리 대표들을 위한 캠퍼스 이벤트 조율 및 예산 배분 주간 싱크",
    status: "waiting",
    color: "tertiary",
    icon: "people",
    heatmapColor: "teal",
    members: [
      makeMember("m6", "정유진", "정유", 0),
      makeMember("m7", "오승현", "오승", 1),
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "r3",
    name: "Research Hub",
    description: "AI 윤리와 지속 가능한 기술 성장에 집중하는 학제 간 연구 그룹",
    status: "active",
    color: "secondary",
    icon: "science",
    heatmapColor: "violet",
    members: [
      makeMember("m8", "윤재현", "윤재", 0),
      makeMember("m9", "임수아", "임수", 1),
      makeMember("m10", "강민서", "강민", 2),
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "r4",
    name: "Design Critique & Feedback",
    description: "UI/UX 팀의 피처 플로우와 브랜드 에셋 리뷰 데일리 세션",
    status: "active",
    color: "primary-container",
    icon: "palette",
    heatmapColor: "rose",
    members: [
      makeMember("m11", "송하린", "송하", 0),
      makeMember("m12", "류다은", "류다", 1),
    ],
    nextSync: "14:00",
    nextSyncDay: "오늘",
    createdAt: new Date().toISOString(),
  },
];

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: SEED_ROOMS,

  addRoom: ({ name, description, color, icon }) =>
    set((s) => ({
      rooms: [
        ...s.rooms,
        {
          id: crypto.randomUUID(),
          name,
          description,
          status: "waiting",
          color,
          icon,
          heatmapColor: "blue",
          members: [],
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateRoom: (id, updates) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  deleteRoom: (id) =>
    set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id) })),

  addMember: (roomId, member) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, members: [...r.members, { ...member, events: member.events ?? [] }] }
          : r
      ),
    })),

  removeMember: (roomId, memberId) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? { ...r, members: r.members.filter((m) => m.id !== memberId) }
          : r
      ),
    })),

  updateMemberColor: (roomId, memberId, colorId) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              members: r.members.map((m) =>
                m.id === memberId ? { ...m, colorId } : m
              ),
            }
          : r
      ),
    })),
}));
