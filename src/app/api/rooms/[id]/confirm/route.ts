import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { getConfirmedSlots, confirmSlots } from "@/server/services/roomService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: roomId } = await params;
    const slots = await getConfirmedSlots(roomId);
    return NextResponse.json({ slots });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id: roomId } = await params;
    const body = await req.json();
    const slots: { dayOfWeek: number; startTime: string; endTime: string }[] =
      body.slots ?? [];
    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "slots 배열이 필요해요" }, { status: 400 });
    }
    const all = await confirmSlots(roomId, slots);
    return NextResponse.json({ slots: all });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
