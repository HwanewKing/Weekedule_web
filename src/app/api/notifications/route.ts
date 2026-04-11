import { NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listNotifications } from "@/server/services/notificationService";

export const runtime = "edge";

export async function GET() {
  try {
    const userId = await requireAuth();
    const notifications = await listNotifications(userId);
    return NextResponse.json({ notifications });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
