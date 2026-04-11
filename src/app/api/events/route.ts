import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listEvents, createEvent } from "@/server/services/eventService";

export async function GET() {
  try {
    const userId = await requireAuth();
    const events = await listEvents(userId);
    return NextResponse.json({ events });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[GET /events]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const { title, description, dayOfWeek, startTime, endTime, location, categoryId, category } = body;
    const resolvedCategoryId = categoryId ?? category ?? undefined;

    if (!title || dayOfWeek == null || !startTime || !endTime) {
      return NextResponse.json({ error: "필수 필드가 누락됐어요" }, { status: 400 });
    }

    const event = await createEvent(userId, { title, description, dayOfWeek, startTime, endTime, location, categoryId: resolvedCategoryId });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[POST /events]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
