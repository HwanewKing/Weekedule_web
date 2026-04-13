import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listRooms, createRoom } from "@/server/services/roomService";



export async function GET() {
  try {
    const userId = await requireAuth();
    const rooms = await listRooms(userId);
    return NextResponse.json({ rooms });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { name, description, color, icon, heatmapColor } = await req.json();
    if (!name || !color || !icon) {
      return NextResponse.json({ error: "필수 필드가 누락됐어요" }, { status: 400 });
    }
    const room = await createRoom(userId, { name, description, color, icon, heatmapColor });
    return NextResponse.json({ room }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
