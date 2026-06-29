// Pre-generates the résumé PDFs from the live print route so the downloaded
// file is pixel-identical to the on-site design — no serverless browser needed.
//
// Usage:
//   1. Start the site:   npm run dev   (or: npm run build && npm run start)
//   2. In another shell: npm run gen:cv
//
// Override the server with BASE_URL=... and the browser with CHROME_PATH=...
import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "cv");

const LOCALES = ["en", "it"];
const PALETTES = ["bronze", "daylight", "midnight"];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

async function firstExisting(paths) {
  for (const p of paths) {
    try {
      await fs.access(p);
      return p;
    } catch {
      /* keep looking */
    }
  }
  return undefined;
}

async function main() {
  const executablePath = await firstExisting(CHROME_CANDIDATES);
  if (!executablePath) {
    throw new Error(
      "No Chrome/Edge found. Set CHROME_PATH to your browser executable."
    );
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"],
  });

  try {
    for (const locale of LOCALES) {
      for (const palette of PALETTES) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
        const url = `${BASE_URL}/${locale}/resume/print?palette=${palette}`;
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
        await page.evaluate(async () => {
          await document.fonts.ready;
        });
        const file = path.join(OUT_DIR, `Lorenzo_Signorelli_CV_${locale}_${palette}.pdf`);
        await page.pdf({
          path: file,
          format: "a4",
          printBackground: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          pageRanges: "1",
        });
        await page.close();
        console.log(`✓ ${path.relative(process.cwd(), file)}`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`\nDone — ${LOCALES.length * PALETTES.length} PDFs written to public/cv/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
