import { db } from "@/server/db";

export async function listCategories(userId: string) {
  return db.category.findMany({ where: { userId } });
}

export async function createCategory(userId: string, label: string, color: string) {
  return db.category.create({ data: { userId, label, color } });
}

export async function updateCategory(id: string, userId: string, data: { label?: string; color?: string }) {
  return db.category.updateMany({ where: { id, userId }, data });
}

export async function deleteCategory(id: string, userId: string) {
  return db.category.deleteMany({ where: { id, userId } });
}
