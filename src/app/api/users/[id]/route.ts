import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { findUserById, updateUserName } from "@/server/services/userService";

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await findUserById(id);
    if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없어요" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[GET /users/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireAuth();
    const { id } = await params;
    if (userId !== id) return NextResponse.json({ error: "권한이 없어요" }, { status: 403 });

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "이름을 입력해주세요" }, { status: 400 });

    const user = await updateUserName(id, name);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("[PATCH /users/:id]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
