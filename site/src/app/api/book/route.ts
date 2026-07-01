import { DateTime } from "luxon";
import { BOOKING, candidateSlots, overlaps } from "@/lib/booking-config";
import { createEvent, getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/book  { start, name, email, topic?, honeypot? }
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

  // Silently accept bots (honeypot) without booking anything.
  if (honeypot) return Response.json({ ok: true });

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

    const event = await createEvent({
      startISO: slot.start,
      endISO: slot.end,
      attendeeEmail: email.trim(),
      attendeeName: name.trim(),
      topic: typeof topic === "string" ? topic.trim() : undefined,
    });

    return Response.json({ ok: true, htmlLink: event.htmlLink, start: slot.start });
  } catch (err) {
    console.error("[book] failed:", err);
    return Response.json({ error: "Could not create the meeting. Please try again." }, { status: 500 });
  }
}
