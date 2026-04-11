import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/server/auth/session";

/**
 * API route 핸들러에서 호출.
 * 인증된 userId를 반환하거나 401 Response를 throw합니다.
 *
 * 사용법:
 *   const userId = await requireAuth();
 */
export async function requireAuth(): Promise<string> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }
  return session.userId;
}
