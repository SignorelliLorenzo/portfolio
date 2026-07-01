import { DateTime } from "luxon";
import { BOOKING, candidateSlots, overlaps } from "@/lib/booking-config";
import { createHold, getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";
import { signToken } from "@/lib/booking-token";
import { sendApprovalRequest } from "@/lib/booking-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/book  { start, name, email, topic?, honeypot? }
// Places a tentative hold and emails the owner an approve/decline link.
export async function POST(req: Request) {
  if (!isCalendarConfigured()) {
    return Response.json({ error: "Booking is not available right now." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { start, name, email, topic, honeypot } = body as Record<string, string | undefined>;

  if (honeypot) return Response.json({ ok: true }); // silently drop bots

  if (
    typeof start !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !EMAIL_RE.test(email.trim())
  ) {
    return Response.json({ error: "Please provide a valid name, email and time." }, { status: 400 });
  }

  const startDt = DateTime.fromISO(start, { zone: BOOKING.timeZone });
  if (!startDt.isValid) {
    return Response.json({ error: "Invalid time." }, { status: 400 });
  }

  // The start must correspond to a legitimate, still-open candidate slot.
  const dateISO = startDt.toFormat("yyyy-MM-dd");
  const slot = candidateSlots(dateISO).find(
    (s) => DateTime.fromISO(s.start).toMillis() === startDt.toMillis()
  );
  if (!slot) {
    return Response.json({ error: "That time isn't available." }, { status: 409 });
  }

  try {
    // Re-check free/busy to avoid double-booking between load and submit.
    const busy = await getBusyIntervals(slot.start, slot.end);
    if (busy.some((b) => overlaps(slot.start, slot.end, b.start, b.end))) {
      return Response.json({ error: "That time was just taken — pick another." }, { status: 409 });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanTopic = typeof topic === "string" ? topic.trim() : undefined;

    // Hold the slot (tentative) so nobody else can grab it while pending.
    const hold = await createHold({
      startISO: slot.start,
      endISO: slot.end,
      attendeeEmail: cleanEmail,
      attendeeName: cleanName,
      topic: cleanTopic,
    });

    // Build signed approve/decline links back to this deployment.
    const host = req.headers.get("host") ?? "";
    const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;
    const tok = signToken({ eventId: hold.id, name: cleanName, email: cleanEmail, start: slot.start });
    const q = `token=${encodeURIComponent(tok)}`;

    await sendApprovalRequest({
      name: cleanName,
      email: cleanEmail,
      topic: cleanTopic,
      whenLabel: startDt.setLocale("en").toFormat("cccc d LLLL yyyy, HH:mm"),
      approveUrl: `${origin}/api/book/approve?${q}`,
      declineUrl: `${origin}/api/book/decline?${q}`,
    });

    return Response.json({ ok: true, pending: true });
  } catch (err) {
    console.error("[book] failed:", err);
    return Response.json({ error: "Could not submit the request. Please try again." }, { status: 500 });
  }
}
