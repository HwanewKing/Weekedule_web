import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다");
  return new TextEncoder().encode(secret + ":invite");
}

export async function signInviteToken(roomId: string): Promise<string> {
  return new SignJWT({ roomId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyInviteToken(token: string): Promise<{ roomId: string }> {
  const { payload } = await jwtVerify(token, getSecret());
  return { roomId: payload.roomId as string };
}
