import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
}

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
    const { name, email, company, subject, message } = body as ContactFormData;

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
