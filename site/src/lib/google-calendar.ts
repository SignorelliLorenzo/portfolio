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

export interface CreateEventInput {
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
  topic?: string;
}

export async function createEvent(input: CreateEventInput): Promise<{ id: string; htmlLink: string }> {
  const token = await accessToken();
  const description = [
    input.topic ? `Topic: ${input.topic}` : null,
    `Requested by ${input.attendeeName} <${input.attendeeEmail}>`,
    "Booked via lorenzo-signorelli.is-a.dev",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(
    `${API}/calendars/${encodeURIComponent(BOOKING.calendarId)}/events?sendUpdates=all&conferenceDataVersion=1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Intro call — ${input.attendeeName}`,
        description,
        start: { dateTime: input.startISO, timeZone: BOOKING.timeZone },
        end: { dateTime: input.endISO, timeZone: BOOKING.timeZone },
        attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
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
  if (!res.ok) throw new Error(`event create failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}
