"use client";

import { create } from "zustand";

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

interface CategoryStore {
  categories: CategoryConfig[];
  fetchCategories: () => Promise<void>;
  addCategory: (label: string, color: string) => Promise<string>;
  updateCategory: (id: string, label: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => CategoryConfig | undefined;
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: [],

  fetchCategories: async () => {
    const res = await fetch("/api/categories");
    if (!res.ok) return;
    const data = await res.json();
    set({ categories: data.categories ?? [] });
  },

  addCategory: async (label, color) => {
    const tempId = `temp_${Date.now()}`;
    set((s) => ({ categories: [...s.categories, { id: tempId, label, color }] }));
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, color }),
      });
      if (res.ok) {
        const data = await res.json();
        set((s) => ({
          categories: s.categories.map((c) => (c.id === tempId ? data.category : c)),
        }));
        return data.category.id;
      } else {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== tempId) }));
      }
    } catch {
      set((s) => ({ categories: s.categories.filter((c) => c.id !== tempId) }));
    }
    return tempId;
  },

  updateCategory: async (id, label, color) => {
    const prev = get().categories;
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, label, color } : c)),
    }));
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, color }),
      });
      if (!res.ok) set({ categories: prev });
    } catch {
      set({ categories: prev });
    }
  },

  deleteCategory: async (id) => {
    const prev = get().categories;
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) set({ categories: prev });
    } catch {
      set({ categories: prev });
    }
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
}));

/** hex 색상에서 EventCard 스타일 값 반환 */
export function getCategoryStyle(color: string) {
  return {
    accent: color,
    bg: color + "20",   // 12% 투명도
    text: color,
  };
}
