import { db } from "@/server/db";

interface RoomInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
  heatmapColor?: string;
}

interface ConfirmSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

async function syncConfirmedSlotEvents(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  room: Awaited<ReturnType<typeof ensureRoomParticipant>>,
  confirmedSlot: { id: string; dayOfWeek: number; startTime: string; endTime: string }
) {
  for (const member of room.members) {
    const existingRoomEvent = await tx.calendarEvent.findFirst({
      where: {
        userId: member.userId,
        sourceConfirmedSlotId: confirmedSlot.id,
      },
      select: { id: true },
    });

    if (existingRoomEvent) {
      continue;
    }

    const conflict = await tx.calendarEvent.findFirst({
      where: {
        userId: member.userId,
        dayOfWeek: confirmedSlot.dayOfWeek,
        startTime: { lt: confirmedSlot.endTime },
        endTime: { gt: confirmedSlot.startTime },
      },
      select: { id: true },
    });

    if (conflict) {
      continue;
    }

    await tx.calendarEvent.create({
      data: {
        userId: member.userId,
        title: `${room.name} Meeting`,
        description: `Room meeting: ${room.name}`,
        dayOfWeek: confirmedSlot.dayOfWeek,
        startTime: confirmedSlot.startTime,
        endTime: confirmedSlot.endTime,
        categoryId: "meeting",
        sourceRoomId: room.id,
        sourceConfirmedSlotId: confirmedSlot.id,
      },
    });
  }
}

async function getAccessibleRoom(roomId: string, userId: string) {
  return db.room.findFirst({
    where: {
      id: roomId,
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
  });
}

function attachPersonalEventsToMembers<
  T extends {
    members: Array<{
      userId: string;
    }>;
  },
>(room: T, personalEvents: Array<{ userId: string }>) {
  const eventsByUser = new Map<string, typeof personalEvents>();

  for (const event of personalEvents) {
    if (!eventsByUser.has(event.userId)) {
      eventsByUser.set(event.userId, []);
    }
    eventsByUser.get(event.userId)!.push(event);
  }

  return {
    ...room,
    members: room.members.map((member) => ({
      ...member,
      personalEvents: eventsByUser.get(member.userId) ?? [],
    })),
  };
}

export async function ensureRoomParticipant(roomId: string, userId: string) {
  const room = await getAccessibleRoom(roomId, userId);
  if (!room) {
    throw new Error("Room not found or access denied.");
  }
  return room;
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

  return rooms.map((room) => attachPersonalEventsToMembers(room, personalEvents));
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

  return attachPersonalEventsToMembers(room, personalEvents);
}

export async function getConfirmedSlots(roomId: string) {
  return db.confirmedSlot.findMany({
    where: { roomId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function syncRoomConfirmedSlots(
  roomId: string,
  actorUserId: string,
  slots: ConfirmSlotInput[],
  cancelIds: string[]
) {
  const room = await ensureRoomParticipant(roomId, actorUserId);

  await db.$transaction(async (tx) => {
    if (cancelIds.length > 0) {
      await tx.calendarEvent.deleteMany({
        where: {
          sourceRoomId: roomId,
          sourceConfirmedSlotId: { in: cancelIds },
        },
      });

      await tx.confirmedSlot.deleteMany({
        where: { id: { in: cancelIds }, roomId },
      });
    }

    for (const slot of slots) {
      const existingConfirmedSlot = await tx.confirmedSlot.findFirst({
        where: {
          roomId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
      });

      if (existingConfirmedSlot) {
        await syncConfirmedSlotEvents(tx, room, existingConfirmedSlot);
        continue;
      }

      const createdSlot = await tx.confirmedSlot.create({
        data: { roomId, ...slot },
      });
      await syncConfirmedSlotEvents(tx, room, createdSlot);
    }
  });

  return getConfirmedSlots(roomId);
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
      OR: [{ ownerId: inviterUserId }, { members: { some: { userId: inviterUserId } } }],
    },
  });

  if (!room) {
    return { error: "諛⑹뿉 李몄뿬 以묒씤 硫ㅻ쾭留??ㅻⅨ 硫ㅻ쾭瑜?珥덈??????덉뼱??" };
  }

  const existing = await db.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: targetUserId } },
  });

  if (existing) {
    return { error: "?대? 諛⑹뿉 李몄뿬 以묒씤 ?ъ슜?먯삁??" };
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
