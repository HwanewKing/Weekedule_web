import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { getConfirmedSlots, confirmSlots, cancelSlots } from "@/server/services/roomService";

export const runtime = "edge";

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
    const newSlots: { dayOfWeek: number; startTime: string; endTime: string }[] = body.slots ?? [];
    const cancelIds: string[] = body.cancelIds ?? [];

    // 새 슬롯 추가
    if (newSlots.length > 0) {
      await confirmSlots(roomId, newSlots);
    }
    // 취소할 슬롯 삭제
    if (cancelIds.length > 0) {
      await cancelSlots(roomId, cancelIds);
    }

    const all = await getConfirmedSlots(roomId);
    return NextResponse.json({ slots: all });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
