import { db } from "@/server/db";

interface RoomInput {
  name: string;
  description?: string;
  color: string;
  icon: string;
  heatmapColor?: string;
}

export async function listRooms(userId: string) {
  return db.room.findMany({
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
  return db.room.findUnique({
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
