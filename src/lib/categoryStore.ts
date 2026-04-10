"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CategoryConfig {
  id: string;
  label: string;
  color: string; // hex e.g. "#4F6CF5"
}

/** 선택 가능한 프리셋 컬러 팔레트 */
export const PRESET_COLORS: string[] = [
  "#4F6CF5", // 파랑
  "#9C6FDE", // 보라
  "#2BB5A0", // 청록
  "#4CAF50", // 초록
  "#FF9800", // 주황
  "#E91E8C", // 분홍
  "#F44336", // 빨강
  "#9E9E9E", // 회색
  "#00BCD4", // 하늘
  "#FF5722", // 딥오렌지
  "#8BC34A", // 연두
  "#607D8B", // 블루그레이
];

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: "class",    label: "수업",   color: "#4F6CF5" },
  { id: "meeting",  label: "미팅",   color: "#9C6FDE" },
  { id: "deepwork", label: "집중",   color: "#2BB5A0" },
  { id: "personal", label: "개인",   color: "#4CAF50" },
  { id: "break",    label: "휴식",   color: "#9E9E9E" },
];

interface CategoryStore {
  categories: CategoryConfig[];
  addCategory: (label: string, color: string) => string;
  updateCategory: (id: string, label: string, color: string) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => CategoryConfig | undefined;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      addCategory: (label, color) => {
        const id = `cat_${Date.now()}`;
        set((s) => ({ categories: [...s.categories, { id, label, color }] }));
        return id;
      },

      updateCategory: (id, label, color) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, label, color } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        }));
      },

      getCategoryById: (id) => get().categories.find((c) => c.id === id),
    }),
    { name: "weekedule-categories" }
  )
);

/** hex 색상에서 EventCard 스타일 값 반환 */
export function getCategoryStyle(color: string) {
  return {
    accent: color,
    bg: color + "20",   // 12% 투명도
    text: color,
  };
}
