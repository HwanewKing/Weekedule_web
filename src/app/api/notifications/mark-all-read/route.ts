import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { markAllRead } from "@/server/services/notificationService";



export async function POST() {
  try {
    const userId = await requireAuth();
    await markAllRead(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
