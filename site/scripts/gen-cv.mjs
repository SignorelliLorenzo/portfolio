// Generates the résumé PDFs from the real print route so the downloaded file is
// pixel-identical to the on-site design. Runs automatically as a `postbuild`
// step (incl. on Vercel) — see package.json.
//
//   node scripts/gen-cv.mjs           against an already-running server (BASE_URL)
//   node scripts/gen-cv.mjs --serve   builds output already exists; boots its own
//                                      `next start`, generates, shuts it down
//
// Browser: local Chrome/Edge in dev, @sparticuz/chromium on Vercel/CI.
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const OUT_DIR = path.join(process.cwd(), "public", "cv");
const LOCALES = ["en", "it"];
const PALETTES = ["bronze", "daylight", "midnight"];
const SERVE = process.argv.includes("--serve");
const PORT = Number(process.env.PORT) || 4399;
const BASE_URL = SERVE ? `http://localhost:${PORT}` : process.env.BASE_URL ?? "http://localhost:3000";

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

async function launchBrowser() {
  // Prefer the @sparticuz binary in serverless/CI builds; use a real local
  // browser during local development.
  const localChrome = await firstExisting(CHROME_CANDIDATES);
  if (localChrome && !process.env.VERCEL && !process.env.CI) {
    return puppeteer.launch({ executablePath: localChrome, headless: true, args: ["--no-sandbox"] });
  }
  const { default: chromium } = await import("@sparticuz/chromium");
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

function killServer(server) {
  if (!server || server.killed) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
    } else {
      process.kill(-server.pid, "SIGKILL"); // kill the whole detached group
    }
  } catch {
    /* already gone */
  }
}

async function waitForServer(url, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not become ready in ${timeoutMs}ms`);
}

async function main() {
  let server;
  if (SERVE) {
    server = spawn(`npx next start -p ${PORT}`, {
      stdio: "inherit",
      shell: true,
      env: process.env,
      detached: process.platform !== "win32",
    });
    await waitForServer(`${BASE_URL}/en/resume/print?palette=bronze`);
  }

  const browser = await launchBrowser();
  await fs.mkdir(OUT_DIR, { recursive: true });

  try {
    for (const locale of LOCALES) {
      for (const palette of PALETTES) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
        await page.goto(`${BASE_URL}/${locale}/resume/print?palette=${palette}`, {
          waitUntil: "networkidle0",
          timeout: 60_000,
        });
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
    killServer(server);
  }
  console.log(`\nDone — ${LOCALES.length * PALETTES.length} PDFs written to public/cv/`);
  // The (possibly detached) server can keep the event loop alive; exit explicitly
  // so `npm run build` returns instead of hanging.
  process.exit(0);
}

main().catch((err) => {
  console.error("CV PDF generation failed:", err);
  process.exit(1);
});
