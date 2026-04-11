import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth/session";

export const runtime = "edge";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
