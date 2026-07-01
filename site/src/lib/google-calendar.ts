import { randomUUID } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { BOOKING } from "./booking-config";

const API = "https://www.googleapis.com/calendar/v3";

function getClient(): OAuth2Client | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return client;
}

/** Whether the Google Calendar credentials are present (server-side). */
export function isCalendarConfigured(): boolean {
  return getClient() !== null;
}

async function accessToken(): Promise<string> {
  const client = getClient();
  if (!client) throw new Error("Google Calendar is not configured");
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Failed to obtain a Google access token");
  return token;
}

export interface BusyInterval {
  start: string;
  end: string;
}

export async function getBusyIntervals(timeMinISO: string, timeMaxISO: string): Promise<BusyInterval[]> {
  const token = await accessToken();
  const res = await fetch(`${API}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: timeMinISO,
      timeMax: timeMaxISO,
      timeZone: BOOKING.timeZone,
      items: [{ id: BOOKING.calendarId }],
    }),
  });
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.calendars?.[BOOKING.calendarId]?.busy ?? [];
}

export interface HoldInput {
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
  topic?: string;
}

const cal = () => encodeURIComponent(BOOKING.calendarId);

/**
 * Places a tentative "hold" on the calendar (no guest invite yet). Being on the
 * calendar makes the slot show as busy, so it can't be double-booked while the
 * request awaits approval.
 */
export async function createHold(input: HoldInput): Promise<{ id: string }> {
  const token = await accessToken();
  const description = [
    input.topic ? `Topic: ${input.topic}` : null,
    `Pending approval — requested by ${input.attendeeName} <${input.attendeeEmail}>`,
    "Booked via lorenzo-signorelli.is-a.dev",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(`${API}/calendars/${cal()}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: `(Pending) Intro call — ${input.attendeeName}`,
      description,
      status: "tentative",
      start: { dateTime: input.startISO, timeZone: BOOKING.timeZone },
      end: { dateTime: input.endISO, timeZone: BOOKING.timeZone },
    }),
  });
  if (!res.ok) throw new Error(`hold create failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { id: data.id };
}

/** Confirms a held event: adds the guest (sends the invite) + a Meet link. */
export async function confirmHold(
  eventId: string,
  attendee: { email: string; name: string }
): Promise<{ htmlLink: string }> {
  const token = await accessToken();
  const res = await fetch(
    `${API}/calendars/${cal()}/events/${encodeURIComponent(eventId)}?sendUpdates=all&conferenceDataVersion=1`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Intro call — ${attendee.name}`,
        status: "confirmed",
        attendees: [{ email: attendee.email, displayName: attendee.name }],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: { useDefault: true },
      }),
    }
  );
  if (!res.ok) throw new Error(`confirm failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { htmlLink: data.htmlLink };
}

/** Removes a held/declined event, freeing the slot. */
export async function deleteEvent(eventId: string): Promise<void> {
  const token = await accessToken();
  const res = await fetch(
    `${API}/calendars/${cal()}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
  // 410 = already gone; treat as success.
  if (!res.ok && res.status !== 410) {
    throw new Error(`delete failed: ${res.status} ${await res.text()}`);
  }
}
