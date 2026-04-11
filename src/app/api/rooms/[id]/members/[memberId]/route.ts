import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { updateMemberColor, removeMember } from "@/server/services/roomService";
import { getSessionFromCookies } from "@/server/auth/session";

export const runtime = "edge";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const userId = await requireAuth();
    const { memberId } = await params;
    const { colorId } = await req.json();
    await updateMemberColor(memberId, userId, colorId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    const { memberId } = await params;
    // 오너 또는 자기 자신만 제거 가능 (roomService에서 처리)
    await removeMember(memberId, session.userId, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
