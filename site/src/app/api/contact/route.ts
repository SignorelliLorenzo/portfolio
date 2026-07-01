import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  honeypot?: string;
  startedAt?: number;
}

// Common throwaway/disposable email providers — reject to cut fake addresses.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "sharklasers.com",
  "10minutemail.com", "tempmail.com", "temp-mail.org", "throwawaymail.com",
  "yopmail.com", "getnada.com", "trashmail.com", "dispostable.com", "fakeinbox.com",
  "maildrop.cc", "mailnesia.com", "spam4.me", "mohmal.com", "emailondeck.com",
]);

// Bots submit instantly; a human takes at least a few seconds.
const MIN_FILL_MS = 3000;
const MAX = { name: 100, email: 200, company: 150, subject: 200, message: 5000 };

const RATE_LIMIT_MAP = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    RATE_LIMIT_MAP.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

const RECIPIENT_EMAIL = "signorelli.lorenzo.business@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, company, subject, message, honeypot, startedAt } = body as ContactFormData;

    // Honeypot: real users never fill this hidden field. Pretend success so
    // bots don't learn they were caught.
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Message received successfully" }, { status: 200 });
    }

    // Time-to-fill trap: submissions faster than a human are almost always bots.
    if (typeof startedAt === "number" && Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) {
      return NextResponse.json({ success: true, message: "Message received successfully" }, { status: 200 });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message too short" },
        { status: 400 }
      );
    }

    // Length caps — block oversized payloads / field stuffing.
    if (
      name.length > MAX.name ||
      email.length > MAX.email ||
      message.length > MAX.message ||
      (company && company.length > MAX.company) ||
      (subject && subject.length > MAX.subject)
    ) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // Reject disposable/throwaway email domains.
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return NextResponse.json(
        { error: "Please use a permanent email address" },
        { status: 400 }
      );
    }

    // Link-flood heuristic: spam messages are usually stuffed with URLs.
    const linkCount = (message.match(/https?:\/\//gi) || []).length;
    if (linkCount > 3) {
      return NextResponse.json(
        { error: "Message flagged as spam" },
        { status: 400 }
      );
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailSubject = subject
        ? `Portfolio Contact: ${subject}`
        : `Portfolio Contact from ${name}`;

      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        replyTo: email,
        subject: emailSubject,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
          <hr />
          <p style="color: #888; font-size: 12px;">Sent from portfolio contact form | IP: ${clientIP}</p>
        `,
      });
    } else {
      console.log("RESEND_API_KEY not set — logging contact submission:", {
        name,
        email,
        company,
        subject,
        message,
        timestamp: new Date().toISOString(),
        ip: clientIP,
      });
    }

    // Optional: Store in Neon database
    if (process.env.DATABASE_URL) {
      try {
        const { getDbClient } = await import("@/lib/db");
        const sql = getDbClient();
        if (sql) {
          await sql`
            INSERT INTO contact_requests (name, email, company, subject, message, ip_address)
            VALUES (${name}, ${email}, ${company || null}, ${subject || null}, ${message}, ${clientIP})
          `;
        }
      } catch (dbError) {
        console.error("Failed to store in database:", dbError);
      }
    }

    return NextResponse.json(
      { success: true, message: "Message received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
