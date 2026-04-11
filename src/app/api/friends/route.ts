import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/server/middleware/requireAuth";
import { listFriends, sendFriendRequest } from "@/server/services/friendService";

export async function GET() {
  try {
    const userId = await requireAuth();
    const data = await listFriends(userId);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "이메일을 입력해주세요" }, { status: 400 });
    const result = await sendFriendRequest(userId, email);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ relation: result.relation }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
