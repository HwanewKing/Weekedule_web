import { NOTIFICATION_TYPES, type NotificationType } from "@/lib/notificationTypes";
import { db } from "@/server/db";

interface NotifInput {
  type: NotificationType;
  title: string;
  body: string;
  actionable?: boolean;
  meta?: Record<string, string | undefined>;
}

async function isNotificationEnabled(userId: string, type: NotificationType) {
  const settings = await db.userSettings.findUnique({
    where: { userId },
    select: { notifJson: true },
  });

  if (!settings?.notifJson) {
    return true;
  }

  try {
    const parsed = JSON.parse(settings.notifJson) as Partial<
      Record<NotificationType, boolean>
    >;

    if (type === "friend_accepted" && parsed.friend_accepted === undefined) {
      return parsed.friend_request ?? true;
    }

    return parsed[type] ?? true;
  } catch {
    return true;
  }
}

export async function createNotification(userId: string, data: NotifInput) {
  if (!NOTIFICATION_TYPES.includes(data.type)) {
    throw new Error(`Unsupported notification type: ${data.type}`);
  }

  const enabled = await isNotificationEnabled(userId, data.type);
  if (!enabled) {
    return null;
  }

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

  return rows.map((notification) => ({
    ...notification,
    meta: notification.metaJson ? JSON.parse(notification.metaJson) : undefined,
    metaJson: undefined,
  }));
}

export async function markRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  return db.notification.deleteMany({ where: { id, userId } });
}
