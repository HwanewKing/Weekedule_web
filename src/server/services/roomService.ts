import { db } from "@/server/db";

interface RoomInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
  heatmapColor?: string;
}

export async function listRooms(userId: string) {
  const rooms = await db.room.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          events: { include: { event: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 모든 룸 멤버의 개인 CalendarEvent를 한 번에 가져옴 (personalEvents for ScheduleOverlap)
  const allUserIds = [...new Set(rooms.flatMap((r) => r.members.map((m) => m.userId)))];
  const personalEvents = allUserIds.length > 0
    ? await db.calendarEvent.findMany({ where: { userId: { in: allUserIds } } })
    : [];

  const eventsByUser = new Map<string, typeof personalEvents>();
  for (const e of personalEvents) {
    if (!eventsByUser.has(e.userId)) eventsByUser.set(e.userId, []);
    eventsByUser.get(e.userId)!.push(e);
  }

  return rooms.map((room) => ({
    ...room,
    members: room.members.map((m) => ({
      ...m,
      personalEvents: eventsByUser.get(m.userId) ?? [],
    })),
  }));
}

export async function createRoom(ownerId: string, data: RoomInput) {
  return db.room.create({
    data: {
      ...data,
      ownerId,
      members: {
        create: { userId: ownerId, colorId: "blue" },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          events: { include: { event: true } },
        },
      },
    },
  });
}

export async function getRoom(id: string) {
  const room = await db.room.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          events: { include: { event: true } },
        },
      },
    },
  });
  if (!room) return null;

  // 멤버의 개인 CalendarEvent도 함께 가져옴 (Feature 2)
  const memberUserIds = room.members.map((m) => m.userId);
  const personalEvents = memberUserIds.length > 0
    ? await db.calendarEvent.findMany({ where: { userId: { in: memberUserIds } } })
    : [];

  const eventsByUser = new Map<string, typeof personalEvents>();
  for (const e of personalEvents) {
    if (!eventsByUser.has(e.userId)) eventsByUser.set(e.userId, []);
    eventsByUser.get(e.userId)!.push(e);
  }

  const membersWithPersonal = room.members.map((m) => ({
    ...m,
    personalEvents: eventsByUser.get(m.userId) ?? [],
  }));

  return { ...room, members: membersWithPersonal };
}

export async function getConfirmedSlots(roomId: string) {
  return db.confirmedSlot.findMany({
    where: { roomId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function confirmSlots(
  roomId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string }[]
) {
  await db.confirmedSlot.createMany({
    data: slots.map((s) => ({ roomId, ...s })),
  });
  return getConfirmedSlots(roomId);
}

export async function cancelSlots(roomId: string, ids: string[]) {
  return db.confirmedSlot.deleteMany({
    where: { id: { in: ids }, roomId },
  });
}

export async function updateRoom(id: string, ownerId: string, data: Partial<RoomInput>) {
  return db.room.updateMany({ where: { id, ownerId }, data });
}

export async function deleteRoom(id: string, ownerId: string) {
  return db.room.deleteMany({ where: { id, ownerId } });
}

export async function addMember(roomId: string, ownerId: string, userId: string) {
  // 오너만 멤버 추가 가능
  const room = await db.room.findFirst({ where: { id: roomId, ownerId } });
  if (!room) return { error: "권한이 없어요" };

  // 이미 멤버인지 확인
  const existing = await db.roomMember.findUnique({ where: { roomId_userId: { roomId, userId } } });
  if (existing) return { error: "이미 멤버예요" };

  return db.roomMember.create({
    data: { roomId, userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateMemberColor(memberId: string, userId: string, colorId: string) {
  return db.roomMember.updateMany({ where: { id: memberId, userId }, data: { colorId } });
}

export async function removeMember(memberId: string, userId: string, ownerId: string) {
  // 오너이거나 자기 자신인 경우만 제거 가능
  return db.roomMember.deleteMany({
    where: {
      id: memberId,
      OR: [{ userId }, { room: { ownerId } }],
    },
  });
}
