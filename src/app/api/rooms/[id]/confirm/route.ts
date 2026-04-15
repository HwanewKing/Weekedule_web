import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import {
  ensureRoomParticipant,
  getConfirmedSlots,
  syncRoomConfirmedSlots,
} from "@/server/services/roomService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: roomId } = await params;
    await ensureRoomParticipant(roomId, userId);
    const slots = await getConfirmedSlots(roomId);
    return NextResponse.json({ slots });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof Error && err.message === "Room not found or access denied.") {
      return NextResponse.json({ error: "룸 접근 권한이 없어요." }, { status: 403 });
    }
    return NextResponse.json({ error: "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뼱?? }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id: roomId } = await params;
    const body = await req.json();
    const newSlots: { dayOfWeek: number; startTime: string; endTime: string }[] =
      body.slots ?? [];
    const cancelIds: string[] = body.cancelIds ?? [];

    const slots = await syncRoomConfirmedSlots(roomId, userId, newSlots, cancelIds);
    return NextResponse.json({ slots });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof Error && err.message === "Room not found or access denied.") {
      return NextResponse.json({ error: "룸 접근 권한이 없어요." }, { status: 403 });
    }
    return NextResponse.json({ error: "?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뼱?? }, { status: 500 });
  }
}
