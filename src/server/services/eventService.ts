import { db } from "@/server/db";

interface EventInput {
  title: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  categoryId?: string;
}

export async function listEvents(userId: string) {
  return db.calendarEvent.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function createEvent(userId: string, data: EventInput) {
  return db.calendarEvent.create({ data: { ...data, userId } });
}

export async function updateEvent(id: string, userId: string, data: Partial<EventInput>) {
  return db.calendarEvent.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteEvent(id: string, userId: string) {
  return db.calendarEvent.deleteMany({ where: { id, userId } });
}

export async function getEventById(id: string) {
  return db.calendarEvent.findUnique({ where: { id } });
}
