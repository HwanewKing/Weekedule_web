import { NextResponse } from "next/server";
import { signFriendInviteToken } from "@/server/auth/friendInviteToken";
import { requireAuth } from "@/server/middleware/requireAuth";

export async function POST() {
  try {
    const userId = await requireAuth();
    const token = await signFriendInviteToken(userId);
    return NextResponse.json({ token });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json(
      { error: "친구 초대 링크를 생성하지 못했어요" },
      { status: 500 }
    );
  }
}
