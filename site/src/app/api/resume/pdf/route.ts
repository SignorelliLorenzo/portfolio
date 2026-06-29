import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

// Headless Chromium needs the Node runtime; PDF render can take a few seconds.
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Vercel/Lambda set these; locally (incl. `next start`) they're absent, so we
// fall back to a real installed browser instead of the @sparticuz binary.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Local dev has no @sparticuz/chromium binary — fall back to an installed browser.
const LOCAL_CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean) as string[];

async function launchBrowser(): Promise<Browser> {
  if (isServerless) {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  return puppeteer.launch({
    executablePath: LOCAL_CHROME_CANDIDATES[0],
    headless: true,
    args: ["--no-sandbox"],
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = url.searchParams.get("locale") === "it" ? "it" : "en";
  const palette = url.searchParams.get("palette") ?? "bronze";

  // Build an absolute URL back to our own deployment for the bare print page.
  const host = req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const target = `${proto}://${host}/${locale}/resume/print?palette=${encodeURIComponent(palette)}`;

  let browser: Browser | undefined;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
    await page.goto(target, { waitUntil: "networkidle0", timeout: 45_000 });
    // Make sure web fonts have finished loading before snapshotting.
    await page.evaluate(async () => {
      await (document as Document).fonts.ready;
    });

    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      // The document is exactly 297mm tall; clamp to one page so a sub-pixel
      // rounding sliver can't spill onto an empty second page.
      pageRanges: "1",
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Lorenzo_Signorelli_CV_${locale.toUpperCase()}.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[resume/pdf] generation failed:", err);
    return new Response("Failed to generate résumé PDF", { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
