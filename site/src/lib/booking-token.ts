import { createHmac, timingSafeEqual } from "node:crypto";

// Signs the approve/decline payload so only links we email can trigger them.
// Reuses an existing server secret — no extra env var needed.
function secret(): string {
  return (
    process.env.BOOKING_APPROVAL_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.RESEND_API_KEY ||
    "insecure-dev-secret"
  );
}

export interface BookingToken {
  eventId: string;
  name: string;
  email: string;
  start: string;
}

export function signToken(payload: BookingToken): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): BookingToken | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", secret()).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as BookingToken;
  } catch {
    return null;
  }
}
