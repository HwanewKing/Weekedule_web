import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/server/services/userService";
import { setSessionCookie } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, language } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 8자 이상이어야 해요" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일이에요" }, { status: 409 });
    }

    const user = await createUser(name, email, password, language ?? "ko");
    await setSessionCookie({ userId: user.id, email: user.email, name: user.name });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
