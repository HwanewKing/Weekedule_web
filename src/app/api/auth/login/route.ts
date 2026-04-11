import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/server/services/userService";
import { verifyPassword } from "@/server/auth/password";
import { setSessionCookie } from "@/server/auth/session";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않아요" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않아요" }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "서버 오류가 발생했어요" }, { status: 500 });
  }
}
