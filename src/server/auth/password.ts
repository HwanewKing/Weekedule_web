const ITERATIONS = 100_000;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): ArrayBuffer {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr.buffer as ArrayBuffer;
}

async function pbkdf2(plain: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
}

export async function hashPassword(plain: string): Promise<string> {
  const saltArr = new Uint8Array(16);
  crypto.getRandomValues(saltArr);
  const salt = saltArr.buffer as ArrayBuffer;
  const bits = await pbkdf2(plain, salt);
  return `pbkdf2$${bufToHex(salt)}$${bufToHex(bits)}`;
}

export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  // bcrypt 레거시 해시는 거부 (Edge Runtime에서 bcryptjs 사용 불가)
  if (!stored.startsWith("pbkdf2$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, saltHex, hashHex] = parts;
  const salt = hexToBuf(saltHex);
  const bits = await pbkdf2(plain, salt);
  return bufToHex(bits) === hashHex;
}
