import { DateTime } from "luxon";

/**
 * Scheduling rules for the on-site meeting booker. Adjust these to change your
 * availability — everything else (slots, validation) derives from here.
 */
export const BOOKING = {
  timeZone: process.env.BOOKING_TIMEZONE || "Europe/Rome",
  calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
  ownerEmail: "signorelli.lorenzo.business@gmail.com",
  slotMinutes: 30,
  minNoticeHours: 24,
  maxDaysAhead: 30,
  // [startHour, endHour) in local time, keyed by ISO weekday (1 = Mon … 7 = Sun)
  workingHours: {
    1: [16, 18],
    2: [16, 18],
    3: [16, 18],
    4: [16, 18],
    5: [16, 18],
  } as Record<number, [number, number] | undefined>,
};

export interface Slot {
  /** ISO 8601 start with timezone offset */
  start: string;
  /** ISO 8601 end with timezone offset */
  end: string;
  /** Human label in the booking timezone, e.g. "14:30" */
  label: string;
}

/** All bookable slots for a local calendar date "YYYY-MM-DD" (before free/busy). */
export function candidateSlots(dateISO: string): Slot[] {
  const day = DateTime.fromISO(dateISO, { zone: BOOKING.timeZone });
  if (!day.isValid) return [];

  const hours = BOOKING.workingHours[day.weekday];
  if (!hours) return []; // not a working day

  const [startH, endH] = hours;
  const dayEnd = day.set({ hour: endH, minute: 0, second: 0, millisecond: 0 });
  const now = DateTime.now().setZone(BOOKING.timeZone);
  const earliest = now.plus({ hours: BOOKING.minNoticeHours });
  const latest = now.plus({ days: BOOKING.maxDaysAhead });

  const slots: Slot[] = [];
  let cursor = day.set({ hour: startH, minute: 0, second: 0, millisecond: 0 });
  while (cursor < dayEnd) {
    const slotEnd = cursor.plus({ minutes: BOOKING.slotMinutes });
    if (slotEnd <= dayEnd && cursor >= earliest && cursor <= latest) {
      slots.push({ start: cursor.toISO()!, end: slotEnd.toISO()!, label: cursor.toFormat("HH:mm") });
    }
    cursor = slotEnd;
  }
  return slots;
}

/** True when two ISO intervals overlap. */
export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = DateTime.fromISO(aStart).toMillis();
  const ae = DateTime.fromISO(aEnd).toMillis();
  const bs = DateTime.fromISO(bStart).toMillis();
  const be = DateTime.fromISO(bEnd).toMillis();
  return as < be && ae > bs;
}
