import { db } from "@/server/db";

interface SettingsInput {
  startOfWeek?: string;
  showWeekends?: boolean;
  gridStart?: number;
  gridEnd?: number;
  theme?: string;
  language?: string;
  notifJson?: string;
}

export async function getSettings(userId: string) {
  const settings = await db.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    return db.userSettings.create({ data: { userId } });
  }
  return settings;
}

export async function updateSettings(userId: string, data: SettingsInput) {
  return db.userSettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}
