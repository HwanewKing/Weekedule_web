import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { getSettings, updateSettings } from "@/server/services/settingsService";

export const runtime = "edge";

export async function GET() {
  try {
    const userId = await requireAuth();
    const settings = await getSettings(userId);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const settings = await updateSettings(userId, body);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
