import { DateTime } from "luxon";
import { BOOKING, candidateSlots, overlaps } from "@/lib/booking-config";
import { getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/availability?date=YYYY-MM-DD → free slots for that day (in BOOKING.timeZone)
export async function GET(req: Request) {
  if (!isCalendarConfigured()) {
    return Response.json({ configured: false, slots: [], timeZone: BOOKING.timeZone });
  }

  const date = new URL(req.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "invalid date" }, { status: 400 });
  }

  const slots = candidateSlots(date);
  if (slots.length === 0) {
    return Response.json({ configured: true, slots: [], timeZone: BOOKING.timeZone });
  }

  const dayStart = DateTime.fromISO(date, { zone: BOOKING.timeZone }).startOf("day");
  const dayEnd = dayStart.plus({ days: 1 });

  try {
    const busy = await getBusyIntervals(dayStart.toISO()!, dayEnd.toISO()!);
    const free = slots.filter((s) => !busy.some((b) => overlaps(s.start, s.end, b.start, b.end)));
    return Response.json({ configured: true, slots: free, timeZone: BOOKING.timeZone });
  } catch (err) {
    console.error("[availability] failed:", err);
    return Response.json({ error: "Could not load availability" }, { status: 502 });
  }
}
