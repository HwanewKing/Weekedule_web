import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listCategories, createCategory } from "@/server/services/categoryService";

export async function GET() {
  try {
    const userId = await requireAuth();
    const categories = await listCategories(userId);
    return NextResponse.json({ categories });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { label, color } = await req.json();
    if (!label || !color) return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
    const category = await createCategory(userId, label, color);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
