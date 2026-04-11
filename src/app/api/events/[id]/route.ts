import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { updateEvent, deleteEvent } from "@/server/services/eventService";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    await updateEvent(id, userId, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[PATCH /events/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    await deleteEvent(id, userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[DELETE /events/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
