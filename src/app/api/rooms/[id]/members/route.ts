import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { addMember } from "@/server/services/roomService";

export const runtime = "edge";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id: roomId } = await params;
    const { userId: targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: "userId가 필요해요" }, { status: 400 });

    const result = await addMember(roomId, userId, targetUserId);
    if (result && "error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ member: result }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
