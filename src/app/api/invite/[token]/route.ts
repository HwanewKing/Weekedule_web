import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { verifyInviteToken } from "@/server/auth/inviteToken";
import { getRoom } from "@/server/services/roomService";
import { db } from "@/server/db";

// GET /api/invite/[token] → 룸 정보 미리보기
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { roomId } = await verifyInviteToken(token);
    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: "룸을 찾을 수 없어요" }, { status: 404 });
    return NextResponse.json({ room: { id: room.id, name: room.name, description: room.description, color: room.color, icon: room.icon, memberCount: room.members.length } });
  } catch {
    return NextResponse.json({ error: "유효하지 않거나 만료된 초대 링크예요" }, { status: 400 });
  }
}

// POST /api/invite/[token] → 룸 참여
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const userId = await requireAuth();
    const { token } = await params;
    const { roomId } = await verifyInviteToken(token);

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: "룸을 찾을 수 없어요" }, { status: 404 });

    const existing = await db.roomMember.findUnique({ where: { roomId_userId: { roomId, userId } } });
    if (existing) return NextResponse.json({ error: "이미 참여 중인 룸이에요" }, { status: 409 });

    const member = await db.roomMember.create({
      data: { roomId, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ member, roomId }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /invite/:token]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
