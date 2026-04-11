import { db } from "@/server/db";

interface NotifInput {
  type: string;
  title: string;
  body: string;
  actionable?: boolean;
  meta?: Record<string, string | undefined>;
}

export async function createNotification(userId: string, data: NotifInput) {
  return db.notification.create({
    data: {
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      actionable: data.actionable ?? false,
      metaJson: data.meta ? JSON.stringify(data.meta) : null,
    },
  });
}

export async function listNotifications(userId: string) {
  const rows = await db.notification.findMany({
    where: { userId },
    orderBy: { time: "desc" },
    take: 50,
  });
  return rows.map((n) => ({
    ...n,
    meta: n.metaJson ? JSON.parse(n.metaJson) : undefined,
    metaJson: undefined,
  }));
}

export async function markRead(id: string, userId: string) {
  return db.notification.updateMany({ where: { id, userId }, data: { read: true } });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function deleteNotification(id: string, userId: string) {
  return db.notification.deleteMany({ where: { id, userId } });
}
