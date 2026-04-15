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
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
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

  const allUserIds = [
    ...new Set(rooms.flatMap((room) => room.members.map((member) => member.userId))),
  ];
  const personalEvents =
    allUserIds.length > 0
      ? await db.calendarEvent.findMany({ where: { userId: { in: allUserIds } } })
      : [];

  const eventsByUser = new Map<string, typeof personalEvents>();
  for (const event of personalEvents) {
    if (!eventsByUser.has(event.userId)) {
      eventsByUser.set(event.userId, []);
    }
    eventsByUser.get(event.userId)!.push(event);
  }

  return rooms.map((room) => ({
    ...room,
    members: room.members.map((member) => ({
      ...member,
      personalEvents: eventsByUser.get(member.userId) ?? [],
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

  const memberUserIds = room.members.map((member) => member.userId);
  const personalEvents =
    memberUserIds.length > 0
      ? await db.calendarEvent.findMany({ where: { userId: { in: memberUserIds } } })
      : [];

  const eventsByUser = new Map<string, typeof personalEvents>();
  for (const event of personalEvents) {
    if (!eventsByUser.has(event.userId)) {
      eventsByUser.set(event.userId, []);
    }
    eventsByUser.get(event.userId)!.push(event);
  }

  const membersWithPersonal = room.members.map((member) => ({
    ...member,
    personalEvents: eventsByUser.get(member.userId) ?? [],
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
    data: slots.map((slot) => ({ roomId, ...slot })),
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

export async function addMember(roomId: string, inviterUserId: string, targetUserId: string) {
  const room = await db.room.findFirst({
    where: {
      id: roomId,
      OR: [
        { ownerId: inviterUserId },
        { members: { some: { userId: inviterUserId } } },
      ],
    },
  });

  if (!room) {
    return { error: "방에 참여 중인 멤버만 다른 멤버를 초대할 수 있어요." };
  }

  const existing = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: targetUserId } },
  });

  if (existing) {
    return { error: "이미 방에 참여 중인 사용자예요." };
  }

  return db.roomMember.create({
    data: { roomId, userId: targetUserId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateMemberColor(memberId: string, userId: string, colorId: string) {
  return db.roomMember.updateMany({ where: { id: memberId, userId }, data: { colorId } });
}

export async function removeMember(memberId: string, userId: string, ownerId: string) {
  return db.roomMember.deleteMany({
    where: {
      id: memberId,
      OR: [{ userId }, { room: { ownerId } }],
    },
  });
}
