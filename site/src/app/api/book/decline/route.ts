import { deleteEvent, isCalendarConfigured } from "@/lib/google-calendar";
import { verifyToken } from "@/lib/booking-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, body: string, icon: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <div style="font-family:sans-serif;max-width:480px;margin:15vh auto;text-align:center;padding:0 20px">
       <div style="font-size:44px;line-height:1;margin-bottom:12px">${icon}</div>
       <h1 style="font-size:22px;margin:0 0 8px">${title}</h1>
       <p style="color:#555">${body}</p>
     </div>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

// GET /api/book/decline?token=... — removes the hold and frees the slot.
export async function GET(req: Request) {
  if (!isCalendarConfigured()) return page("Unavailable", "Booking is not configured.", "⚠️");

  const token = new URL(req.url).searchParams.get("token") ?? "";
  const data = verifyToken(token);
  if (!data) return page("Invalid link", "This link is invalid or has expired.", "⚠️");

  try {
    await deleteEvent(data.eventId);
    return page("Meeting declined", "The hold was removed and the slot is free again.", "🗑️");
  } catch (err) {
    console.error("[decline] failed:", err);
    return page("Something went wrong", "Could not remove the hold. It may already be gone.", "⚠️");
  }
}
