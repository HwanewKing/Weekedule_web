import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";

const DEFAULT_CATEGORIES_KO = [
  { label: "수업", color: "#4F6CF5" },
  { label: "미팅", color: "#10B981" },
  { label: "집중", color: "#F59E0B" },
  { label: "개인", color: "#8B5CF6" },
  { label: "휴식", color: "#EC4899" },
];

const DEFAULT_CATEGORIES_EN = [
  { label: "Class",    color: "#4F6CF5" },
  { label: "Meeting",  color: "#10B981" },
  { label: "Focus",    color: "#F59E0B" },
  { label: "Personal", color: "#8B5CF6" },
  { label: "Break",    color: "#EC4899" },
];

export async function createUser(name: string, email: string, password: string, language = "ko") {
  const hashed = await hashPassword(password);
  const defaultCategories = language === "en" ? DEFAULT_CATEGORIES_EN : DEFAULT_CATEGORIES_KO;
  return db.user.create({
    data: {
      name,
      email,
      password: hashed,
      verified: true, // 이메일 인증 생략 (MVP)
      categories: { create: defaultCategories },
      settings: { create: {} },
    },
    select: { id: true, name: true, email: true },
  });
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}

export async function updateUserName(id: string, name: string) {
  return db.user.update({
    where: { id },
    data: { name },
    select: { id: true, name: true, email: true },
  });
}
