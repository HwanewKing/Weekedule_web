import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다");
  return new TextEncoder().encode(`${secret}:friend-invite`);
}

export async function signFriendInviteToken(inviterId: string): Promise<string> {
  return new SignJWT({ inviterId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyFriendInviteToken(
  token: string
): Promise<{ inviterId: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  return { inviterId: payload.inviterId as string };
}
