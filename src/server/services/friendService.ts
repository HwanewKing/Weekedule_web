import { db } from "@/server/db";
import { createNotification } from "./notificationService";

export async function sendFriendRequest(requesterId: string, toEmail: string) {
  const addressee = await db.user.findUnique({ where: { email: toEmail } });
  if (!addressee) return { error: "해당 이메일의 사용자를 찾을 수 없어요" };
  if (addressee.id === requesterId) return { error: "자신에게 친구 요청을 보낼 수 없어요" };

  const existing = await db.friendRelation.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: requesterId },
      ],
    },
  });
  if (existing) return { error: "이미 친구 관계이거나 요청이 진행 중이에요" };

  const requester = await db.user.findUnique({ where: { id: requesterId } });
  const relation = await db.friendRelation.create({
    data: { requesterId, addresseeId: addressee.id },
  });

  await createNotification(addressee.id, {
    type: "friend_request",
    title: "친구 요청",
    body: `${requester?.name}님이 친구 요청을 보냈어요`,
    actionable: true,
    meta: { fromName: requester?.name, relationId: relation.id },
  });

  return { relation };
}

export async function respondToRequest(
  relationId: string,
  userId: string,
  action: "accept" | "decline"
) {
  const relation = await db.friendRelation.findFirst({
    where: { id: relationId, addresseeId: userId, status: "pending" },
  });
  if (!relation) return { error: "요청을 찾을 수 없어요" };

  if (action === "decline") {
    await db.friendRelation.delete({ where: { id: relationId } });
    return { ok: true };
  }

  const updated = await db.friendRelation.update({
    where: { id: relationId },
    data: { status: "accepted" },
  });

  const accepter = await db.user.findUnique({ where: { id: userId } });
  await createNotification(relation.requesterId, {
    type: "meeting_confirmed",
    title: "친구 요청 수락",
    body: `${accepter?.name}님이 친구 요청을 수락했어요`,
    meta: { fromName: accepter?.name },
  });

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
    .filter((r) => r.status === "accepted")
    .map((r) => ({
      id: r.id,
      status: r.status,
      friend: r.requesterId === userId ? r.addressee : r.requester,
    }));

  const pendingIn = relations
    .filter((r) => r.status === "pending" && r.addresseeId === userId)
    .map((r) => ({ id: r.id, from: r.requester }));

  const pendingOut = relations
    .filter((r) => r.status === "pending" && r.requesterId === userId)
    .map((r) => ({ id: r.id, to: r.addressee }));

  return { friends, pendingIn, pendingOut };
}
