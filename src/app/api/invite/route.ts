import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { signInviteToken } from "@/server/auth/inviteToken";
import { getRoom } from "@/server/services/roomService";

// POST /api/invite  { roomId } → { token }
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const { roomId } = await req.json();
    if (!roomId) return NextResponse.json({ error: "roomId가 필요해요" }, { status: 400 });

    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: "룸을 찾을 수 없어요" }, { status: 404 });
    if (room.ownerId !== userId) return NextResponse.json({ error: "방장만 초대 링크를 생성할 수 있어요" }, { status: 403 });

    const token = await signInviteToken(roomId);
    return NextResponse.json({ token });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /invite]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
