import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/server/auth/session";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: { id: session.userId, email: session.email, name: session.name },
  });
}
