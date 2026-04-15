import { db } from "@/server/db";
import { createNotification } from "./notificationService";

async function notifyFriendAccepted(requesterId: string, accepterId: string) {
  const accepter = await db.user.findUnique({ where: { id: accepterId } });

  await createNotification(requesterId, {
    type: "friend_accepted",
    title: "친구 요청 수락",
    body: `${accepter?.name ?? "상대방"}님이 친구 요청을 수락했어요.`,
    meta: { fromName: accepter?.name },
  });
}

async function createFriendRequest(requesterId: string, addresseeId: string) {
  if (addresseeId === requesterId) {
    return { error: "자기 자신에게 친구 요청을 보낼 수 없어요.", code: "self" as const };
  }

  const existing = await db.friendRelation.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "accepted") {
      return { error: "이미 친구 관계예요.", code: "already" as const };
    }

    if (existing.requesterId === requesterId) {
      return { error: "이미 친구 요청을 보냈어요.", code: "pending" as const };
    }

    const updated = await db.friendRelation.update({
      where: { id: existing.id },
      data: { status: "accepted" },
    });

    await notifyFriendAccepted(existing.requesterId, requesterId);

    return { relation: updated, autoAccepted: true as const };
  }

  const requester = await db.user.findUnique({ where: { id: requesterId } });
  const relation = await db.friendRelation.create({
    data: { requesterId, addresseeId },
  });

  await createNotification(addresseeId, {
    type: "friend_request",
    title: "친구 요청",
    body: `${requester?.name ?? "누군가"}님이 친구 요청을 보냈어요.`,
    actionable: true,
    meta: { fromName: requester?.name, relationId: relation.id },
  });

  return { relation };
}

export async function sendFriendRequest(requesterId: string, toEmail: string) {
  const addressee = await db.user.findUnique({ where: { email: toEmail } });
  if (!addressee) {
    return { error: "해당 이메일의 사용자를 찾을 수 없어요.", code: "not_found" as const };
  }

  return createFriendRequest(requesterId, addressee.id);
}

export async function sendFriendRequestToUser(requesterId: string, addresseeId: string) {
  const addressee = await db.user.findUnique({ where: { id: addresseeId } });
  if (!addressee) {
    return { error: "초대 대상 사용자를 찾을 수 없어요.", code: "not_found" as const };
  }

  return createFriendRequest(requesterId, addressee.id);
}

export async function respondToRequest(
  relationId: string,
  userId: string,
  action: "accept" | "decline"
) {
  const relation = await db.friendRelation.findFirst({
    where: { id: relationId, addresseeId: userId, status: "pending" },
  });

  if (!relation) {
    return { error: "요청을 찾을 수 없어요." };
  }

  if (action === "decline") {
    await db.friendRelation.delete({ where: { id: relationId } });
    return { ok: true };
  }

  const updated = await db.friendRelation.update({
    where: { id: relationId },
    data: { status: "accepted" },
  });

  await notifyFriendAccepted(relation.requesterId, userId);

  return { relation: updated };
}

export async function removeFriend(relationId: string, userId: string) {
  return db.friendRelation.deleteMany({
    where: {
      id: relationId,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });
}

export async function listFriends(userId: string) {
  const relations = await db.friendRelation.findMany({
    where: {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      addressee: { select: { id: true, name: true, email: true } },
    },
  });

  const friends = relations
    .filter((relation) => relation.status === "accepted")
    .map((relation) => ({
      id: relation.id,
      status: relation.status,
      friend: relation.requesterId === userId ? relation.addressee : relation.requester,
    }));

  const pendingIn = relations
    .filter((relation) => relation.status === "pending" && relation.addresseeId === userId)
    .map((relation) => ({ id: relation.id, from: relation.requester }));

  const pendingOut = relations
    .filter((relation) => relation.status === "pending" && relation.requesterId === userId)
    .map((relation) => ({ id: relation.id, to: relation.addressee }));

  return { friends, pendingIn, pendingOut };
}
